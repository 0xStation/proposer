import { BlitzPage } from "blitz"
import { useState } from "react"
import { useSignTypedData, useToken } from "wagmi"
import { utils } from "ethers"
import Navigation from "app/terminal/components/settings/navigation"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import getFundingTokens from "app/core/utils/getFundingTokens"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import { TypedDataTypeDefinition } from "app/types"
import { useQuery, useMutation, useParam } from "blitz"
import createCheck from "app/check/mutations/createCheck"
import createCheckApproval from "app/checkApproval/mutations/createCheckApproval"
import getCheckbooksByTerminal from "app/checkbook/queries/getCheckbooksByTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getAllAccounts from "app/account/queries/getAllAccounts"
import { zeroAddress } from "app/core/utils/constants"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"

/**
 * THIS IS A DEV TOOL
 * this is not production code
 * this is not meant to have good UX or be what users see/touch
 * this is meant to show a dev how check signatures need to be prepared to be valid for the Checkbook contracts
 */

/**
 * Type Definitions
 * these tell the wallet how to structure the signature UI and the cryptography encoding
 * */

// type definition of a single check, order matters
// types per value are using Solidity types
// keys are capitalized because they mimic Solidity structs
const singleCheckTypes: TypedDataTypeDefinition = {
  Check: [
    { name: "recipient", type: "address" },
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
}
// only needed for Split Checks, but keeping for now
// type definition of multiple checks at once
// uses nested type of previously defined `Check`
// const bulkCheckTypes: TypedDataTypeDefinition = {
//   ...singleCheckTypes,
//   BulkCheck: [{ name: "checks", type: "Check[]" }],
// }

const ApprovalSignaturesPage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  // queue used for demoing split checks, not needed for right now
  // const [checkQueue, setCheckQueue] = useState<Check[]>([])
  const setToastState = useStore((state) => state.setToastState)

  const [tokenAddress, setTokenAddress] = useState<string>()

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle }
  )

  const [checkbooks] = useQuery(
    getCheckbooksByTerminal,
    { terminalId: terminal?.id || 0 }, // does anyone know how to get rid of typescript errors here?
    { suspense: false, enabled: !!terminal } // it wont run unless terminal exists, but TS doesnt pick up on that
  )

  const [allAccounts] = useQuery(getAllAccounts, {}, { suspense: false })

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

  const generateCheck = async (check) => {
    // need this for my jank frontend setup, advice would be helpful!
    setTokenAddress(check.token)
    const checkbookChainId =
      checkbooks?.find((c) => c.address === check.checkbookAddress)?.chainId || 0
    const decimals = tokenAddress === zeroAddress ? 18 : tokenData?.decimals || 0

    // generate check
    const newCheck = await createCheckMutation({
      proposalId: "", // dummy for now
      fundingAddress: check.checkbookAddress,
      chainId: checkbookChainId,
      recipientAddress: check.recipient,
      tokenAddress: check.token,
      tokenAmount: check.amount, // store value with decimals
      tokenDecimals: decimals,
    })

    // generate signature and create CheckApproval
    try {
      // 3 parts to a typed-data signature:
      //   1. domain
      //   2. types
      //   3. value

      // DOMAIN
      // top-level definition of where this signature will be used
      // `name` is hardcoded to "Checkbook" in each contract
      // `version` is also harcoded to "1" in each contract
      // `chainId` should be the actual id for the contract, 4 is hardcoded for Rinkeby testing
      // `verifyingContract` is the address of the contract that will be consuming this signature (the checkbook)
      const domain = {
        name: "Checkbook", // keep hardcoded
        version: "1", // keep hardcoded
        chainId: checkbookChainId,
        verifyingContract: check.checkbookAddress,
      }

      const types = singleCheckTypes

      const value = {
        recipient: newCheck.recipientAddress,
        token: newCheck.tokenAddress,
        amount: decimalToBigNumber(newCheck.tokenAmount, decimals),
        deadline: newCheck.deadline.valueOf(),
        nonce: newCheck.nonce,
      }

      // prompt the Metamask signature modal
      const signature = await signApproval({
        domain,
        types,
        value,
      })

      await createCheckApprovalMutation({
        checkId: newCheck.id,
        signerAddress: activeUser?.address as string,
        signature,
      })

      return true
    } catch (e) {
      console.error(e)
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
              // setCheckQueue([...checkQueue, values])
              try {
                const success = await generateCheck(values)
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
              const disableSubmit =
                !formState.values.checkbookAddress ||
                !formState.values.recipient ||
                !formState.values.token ||
                !formState.values.amount
              return (
                <form onSubmit={handleSubmit}>
                  <div className="w-1/3 flex flex-col col-span-2 mt-6">
                    <label className="font-bold block">Checkbook*</label>
                    <Field name={`checkbookAddress`}>
                      {({ input }) => (
                        <div className="custom-select-wrapper">
                          <select
                            {...input}
                            className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-1`}
                          >
                            <option value="">Choose option</option>
                            {checkbooks?.map((cb, idx) => {
                              return (
                                <option key={`checkbook-${idx}`} value={cb.address}>
                                  {cb.name}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )}
                    </Field>

                    <label className="font-bold block mt-4">Recipient*</label>
                    <Field name={`recipient`}>
                      {({ input }) => (
                        <div className="custom-select-wrapper">
                          <select
                            {...input}
                            className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-1`}
                          >
                            <option value="">Choose option</option>
                            {allAccounts?.map((a, id) => {
                              return (
                                <option key={`account-${id}`} value={a.address}>
                                  {a.data?.name}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )}
                    </Field>

                    <label className="font-bold block mt-4">Token*</label>
                    <Field name={`token`}>
                      {({ input }) => (
                        <div className="custom-select-wrapper">
                          <select
                            {...input}
                            className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-1`}
                          >
                            <option value="">Choose option</option>
                            {getFundingTokens(
                              checkbooks?.find(
                                (c) => c.address === formState.values.checkbookAddress
                              ),
                              terminal
                            )?.map((a, id) => {
                              return (
                                <option key={`account-${id}`} value={a.address}>
                                  {a.symbol}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )}
                    </Field>

                    <label htmlFor="name" className="text-marble-white text-base mt-4">
                      Amount*
                    </label>
                    <Field
                      component="input"
                      name="amount"
                      placeholder="0"
                      className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                    />
                    <button
                      type="submit"
                      className={`rounded text-tunnel-black text-bold px-8 py-2 w-full mt-12 ${
                        disableSubmit ? "bg-concrete" : "bg-electric-violet"
                      }`}
                      disabled={disableSubmit}
                    >
                      Generate Check & Sign
                    </button>
                  </div>
                </form>
              )
            }}
          />
          {/* below is code for multi-check systems, saving for later */}
          {/* <div className="overflow-y-auto col-span-7 sm:col-span-4 mt-4">
            {checkQueue.map((c, i) => (
              <span key={i} className="flex flex-row space-x-24 p-2">{`send ${truncateString(
                c.recipient
              )} ${c.amount} tokens (${truncateString(c.token)})`}</span>
            ))}
          </div>
          <button
            className="bg-magic-mint text-tunnel-black rounded mt-12 block p-2 hover:opacity-70"
            disabled={checkQueue.length === 0}
            onClick={() => {
              try {
                approveChecks(checkQueue)
              } catch (error) {
                console.error(`Error creating account: ${error}`)
                alert("Error applying.")
              }
            }}
          >
            Approve
          </button> */}
        </section>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

ApprovalSignaturesPage.suppressFirstRenderFlicker = true

export default ApprovalSignaturesPage
