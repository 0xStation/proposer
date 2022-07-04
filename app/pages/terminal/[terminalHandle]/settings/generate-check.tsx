import { BlitzPage } from "blitz"
import { useState } from "react"
import { useSignTypedData, useToken } from "wagmi"
import Navigation from "app/terminal/components/settings/navigation"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import { TypedDataTypeDefinition } from "app/types"
import { useQuery, useMutation, useParam } from "blitz"
import createCheck from "app/check/mutations/createCheck"
import createCheckApproval from "app/checkApproval/mutations/createCheckApproval"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getProposalsByTerminal from "app/proposal/queries/getProposalsByTerminal"
import { zeroAddress } from "app/core/utils/constants"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"
import { Check } from "@prisma/client"

/**
 * THIS IS A DEV TOOL
 * this is not production code
 * this is not meant to have good UX or be what users see/touch
 * this is meant to show a dev how check signatures need to be prepared to be valid for the Checkbook contracts
 */

const GenerateCheckPage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)

  const [tokenAddress, setTokenAddress] = useState<string>()

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle }
  )

  const [proposals] = useQuery(
    getProposalsByTerminal,
    { terminalId: terminal?.id || 0 }, // does anyone know how to get rid of typescript errors here?
    { suspense: false, enabled: !!terminal } // it wont run unless terminal exists, but TS doesnt pick up on that
  )

  const [createCheckMutation] = useMutation(createCheck, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })
  const [createCheckApprovalMutation] = useMutation(createCheckApproval, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  let { signTypedDataAsync: signApproval } = useSignTypedData()

  const { data: tokenData } = useToken({
    ...(!!tokenAddress && tokenAddress !== zeroAddress && { address: tokenAddress }),
  })

  const approveCheck = async (check: Check, decimals: number) => {
    // 3 parts to a typed-data signature:
    //   1. domain: metadata about the contract and where it is located
    //   2. types: definition of the typed object being signed at once
    //   3. value: values that fit into the types definition
    try {
      /**
       * DOMAIN
       * top-level definition of where this signature will be used
       * `name` is hardcoded to "Checkbook" in each contract
       * `version` is also harcoded to "1" in each contract
       * `chainId` should be the actual id for the contract, 4 is hardcoded for Rinkeby testing
       * `verifyingContract` is the address of the contract that will be consuming this signature (the checkbook)
       */
      const domain = {
        name: "Checkbook", // keep hardcoded
        version: "1", // keep hardcoded
        chainId: check.chainId,
        verifyingContract: check.fundingAddress,
      }

      /**
       * TYPES
       * definition of the object representing a single check, order and types matter
       * types per value are using Solidity types
       * `Check` is capitalized to mimic Solidity structs
       * `recipient` is the address of the check recipient
       * `token` is the address of the currency token where the zero address represents ETH
       * `amount` is the uint representation of amount of tokens to move (requires BigNumber package in js/ts)
       * `deadline` is the expiry date of this check represented as a unix timestamp
       * `nonce` is the unique identifier for this check to prevent double spending
       */
      const types: TypedDataTypeDefinition = {
        Check: [
          { name: "recipient", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      }

      /**
       * VALUE
       * instantiation of a typed object reflecting `types`
       * all required data comes from the `Check` entity to guarantee consistent values across all of its approvals
       * notice that `decimalToBigNumber` is needed to convert db values into contract-readable values
       */
      const value = {
        recipient: check.recipientAddress,
        token: check.tokenAddress,
        amount: decimalToBigNumber(check.tokenAmount, decimals),
        deadline: check.deadline.valueOf(),
        nonce: check.nonce,
      }

      // prompt the Metamask signature modal
      const signature = await signApproval({
        domain,
        types,
        value,
      })

      await createCheckApprovalMutation({
        checkId: check.id,
        signerAddress: activeUser?.address as string,
        signature,
      })

      return true
    } catch (e) {
      console.error(e)
      if (e.name == "ConnectorNotFoundError") {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Please reset wallet connection.\n(ConnectorNotFoundError)",
        })
      } else {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Contract creation failed.",
        })
      }
      return false
    }
  }

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <section className="flex-1 ml-10">
          <h2 className="text-marble-white text-2xl font-bold mt-10">Generate Check</h2>
          <Form
            onSubmit={async (values: any, form) => {
              try {
                const proposal = proposals?.find((p) => p.id === values.proposal)
                // need this for my jank frontend setup, advice would be helpful!
                setTokenAddress(proposal?.data.funding.token)
                const decimals =
                  proposal?.data.funding.token === zeroAddress ? 18 : tokenData?.decimals || 0

                let check
                if (proposal?.checks.length === 0) {
                  // only call the mutation if you need a new check!
                  const newCheck = await createCheckMutation({
                    proposalId: values.proposal, // dummy for now
                    fundingAddress: proposal?.rfp?.checkbook.address || "",
                    chainId: proposal?.rfp?.checkbook.chainId || 0,
                    recipientAddress: proposal?.data.funding.recipientAddress || "",
                    tokenAddress: proposal?.data.funding.token || "",
                    tokenAmount: proposal?.data.funding.amount.toString() || "", // store as decimal value instead of BigNumber
                  })
                  check = newCheck
                } else {
                  check = proposal?.checks[0]
                }

                const success = await approveCheck(check, decimals)

                if (success) {
                  setToastState({
                    isToastShowing: true,
                    type: "success",
                    message: "New check approval created.",
                  })
                  form.reset()
                }
              } catch (error) {
                console.error(`Error generating check: ${error}`)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: "Error with check generation",
                })
                alert("Error generating check.")
              }
            }}
            render={({ form, handleSubmit }) => {
              const formState = form.getState()
              const disableSubmit = !formState.values.proposal
              return (
                <form onSubmit={handleSubmit}>
                  <div className="w-1/3 flex flex-col col-span-2 mt-6">
                    <label className="font-bold block">Proposal*</label>
                    <Field name={`proposal`}>
                      {({ input }) => (
                        <div className="custom-select-wrapper">
                          <select
                            {...input}
                            className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-1`}
                          >
                            <option value="">Choose option</option>
                            {proposals?.map((p, idx) => {
                              return (
                                <option key={`checkbook-${idx}`} value={p.id}>
                                  {p.data?.content.title}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )}
                    </Field>
                    <button
                      type="submit"
                      className={`rounded text-tunnel-black text-bold px-8 py-2 w-full mt-12 ${
                        disableSubmit ? "bg-concrete" : "bg-electric-violet"
                      }`}
                      disabled={disableSubmit}
                    >
                      Approve & Generate Check
                    </button>
                  </div>
                </form>
              )
            }}
          />
        </section>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

GenerateCheckPage.suppressFirstRenderFlicker = true

export default GenerateCheckPage
