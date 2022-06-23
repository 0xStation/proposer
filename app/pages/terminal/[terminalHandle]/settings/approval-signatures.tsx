import { BlitzPage } from "blitz"
import { useSignTypedData } from "wagmi"
import Navigation from "app/terminal/components/settings/navigation"
import { Field, Form } from "react-final-form"
import { useState } from "react"
import useStore from "app/core/hooks/useStore"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import { TypedDataTypeDefinition, TypedDataSignatureDomain } from "app/types"
import { truncateString } from "app/core/utils/truncateString"
import { useMutation } from "blitz"
import createCheck from "app/check/mutations/createCheck"
import createCheckApproval from "app/checkApproval/mutations/createCheckApproval"
import { signatureToVRS } from "app/core/utils/signatureToVRS"

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
// type definition of multiple checks at once
// uses nested type of previously defined `Check`
const bulkCheckTypes: TypedDataTypeDefinition = {
  ...singleCheckTypes,
  BulkCheck: [{ name: "checks", type: "Check[]" }],
}

type Check = {
  recipient: string
  token: string
  amount: string
}

const ApprovalSignaturesPage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const [checkQueue, setCheckQueue] = useState<Check[]>([])

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

  // change this per Checkbook being used for the Proposal
  const checkbookAddress = "0x0FF725b0e0DAFD6D29d4794892651d382a3E5bE8"
  const checkbookChainId = 4

  // top-level definition of where this signature will be used
  // `name` is hardcoded to "Checkbook" in each contract
  // `version` is also harcoded to "1" in each contract
  // `chainId` should be the actual id for the contract, 4 is hardcoded for Rinkeby testing
  // `verifyingContract` is the address of the contract that will be consuming this signature (the checkbook)
  const domain: TypedDataSignatureDomain = {
    name: "Checkbook",
    version: "1",
    chainId: checkbookChainId,
    verifyingContract: checkbookAddress,
  }

  let { signTypedDataAsync: signApproval } = useSignTypedData()

  const approveChecks = async (checks: Check[]) => {
    if (!activeUser?.address) {
      throw Error("Missing wallet connection")
    }

    // intentional log, for the developers benefit to see what's happening
    console.log(checks)
    let types
    let value
    if (checks.length > 1) {
      types = bulkCheckTypes
      value = { checks }
      console.log("not ready")
      return
    }

    const check = checks[0]!

    const deadline = new Date()
    // missing edge cases for days in a month, but good enough for now
    if (deadline.getMonth() < 12) {
      deadline.setMonth(deadline.getMonth() + 1)
    } else {
      deadline.setMonth(1)
      deadline.setFullYear(deadline.getFullYear() + 1)
    }

    // generate check
    const newCheck = await createCheckMutation({
      proposalId: "", // dummy for now
      fundingAddress: checkbookAddress, // dummy
      chainId: checkbookChainId, // dummy
      recipientAddress: check.recipient,
      tokenAddress: check.token,
      tokenAmount: parseInt(check.amount),
      deadline,
    })

    types = singleCheckTypes
    value = {
      ...check,
      deadline: deadline.valueOf(),
      nonce: newCheck.nonce,
    }

    try {
      console.log("try sign")
      // prompt the Metamask signature modal
      const signature = await signApproval({
        domain,
        types,
        value,
      })

      // split signature to v,r,s components (probably not needed, just for show)
      const { v, r, s } = signatureToVRS(signature)
      // intentional log, for the developers benefit to see what's happening
      console.log(
        `signer: ${activeUser?.address}\nsignature:${signature}\nv: ${v}\nr: ${r}\ns: ${s}`
      )

      await createCheckApprovalMutation({
        checkId: newCheck.id,
        signerAddress: activeUser?.address as string,
        signature,
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <section className="flex-1 ml-10">
          <Form
            onSubmit={async (values: any) => {
              setCheckQueue([...checkQueue, values])
            }}
            render={({ handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <div className="w-1/3 flex flex-col col-span-2 mt-10">
                  {/*
                    Funding recipient address
                  */}
                  <label htmlFor="name" className="text-marble-white text-base mt-4">
                    Recipient Address
                  </label>
                  <Field
                    component="input"
                    name="recipient"
                    placeholder="0x..."
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  {/*
                    Funding token address, zero address (0x000...000) is used to represent ETH
                  */}
                  <label htmlFor="name" className="text-marble-white text-base mt-4">
                    Token Address
                  </label>
                  <Field
                    component="input"
                    name="token"
                    placeholder="0x..."
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  {/*
                    Amount of tokens for Check, should have full decimals of token,
                    make sure to use ethers.BigNumber or string type
                  */}
                  <label htmlFor="name" className="text-marble-white text-base mt-4">
                    Token Amount
                  </label>
                  <Field
                    component="input"
                    name="amount"
                    placeholder="0"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  <button
                    type="submit"
                    className="bg-electric-violet text-tunnel-black w-1/2 rounded mt-12 block p-2 hover:opacity-70"
                  >
                    Add to Queue
                  </button>
                </div>
              </form>
            )}
          />
          <div className="overflow-y-auto col-span-7 sm:col-span-4 mt-4">
            {checkQueue.map((c, i) => (
              <span key={i} className="flex flex-row space-x-24 p-2">{`send ${truncateString(
                c.recipient
              )} ${c.amount} tokens (${truncateString(c.token)})`}</span>
            ))}
          </div>
          <button
            className="bg-electric-violet text-tunnel-black rounded mt-12 block p-2 hover:opacity-70"
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
          </button>
        </section>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

ApprovalSignaturesPage.suppressFirstRenderFlicker = true

export default ApprovalSignaturesPage
