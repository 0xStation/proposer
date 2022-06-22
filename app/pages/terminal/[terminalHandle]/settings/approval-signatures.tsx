import { BlitzPage } from "blitz"
import { useSignTypedData } from "wagmi"
import Navigation from "app/terminal/components/settings/navigation"
import { Field, Form } from "react-final-form"
import { useState } from "react"
import useStore from "app/core/hooks/useStore"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import { TypedDataTypeDefinition, TypedDataSignatureDomain } from "app/types"
import { truncateString } from "app/core/utils/truncateString"

const signatureToRSV = (signature: string) => {
  const r = "0x" + signature.substring(2).substring(0, 64)
  const s = "0x" + signature.substring(2).substring(64, 128)
  const v = parseInt(signature.substring(2).substring(128, 130), 16)
  return { r, s, v }
}

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
  deadline: string
  nonce: string
}

const ApprovalSignaturesPage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const [checkQueue, setCheckQueue] = useState<Check[]>([])

  // change this per Checkbook being used for the Proposal
  const checkbookAddress = "0x016562aA41A8697720ce0943F003141f5dEAe006"

  // top-level definition of where this signature will be used
  // `name` is hardcoded to "Checkbook" in each contract
  // `version` is also harcoded to "1" in each contract
  // `chainId` should be the actual id for the contract, 4 is hardcoded for Rinkeby testing
  // `verifyingContract` is the address of the contract that will be consuming this signature (the checkbook)
  const domain: TypedDataSignatureDomain = {
    name: "Checkbook",
    version: "1",
    chainId: 4,
    verifyingContract: checkbookAddress,
  }

  let { signTypedDataAsync: signApproval } = useSignTypedData()

  const approveChecks = async (checks: Check[]) => {
    // intentional log, for the developers benefit to see what's happening
    console.log(checks)
    let types
    let value
    if (checks.length > 1) {
      types = bulkCheckTypes
      value = { checks }
    } else {
      types = singleCheckTypes
      value = checks[0]!
    }

    try {
      // prompt the Metamask signature modal
      const signature = await signApproval({
        domain,
        types,
        value,
      })

      // split signature to v,r,s components (probably not needed, just for show)
      const { v, r, s } = signatureToRSV(signature)
      // intentional log, for the developers benefit to see what's happening
      console.log(
        `signer: ${activeUser?.address}\nsignature:${signature}\nv: ${v}\nr: ${r}\ns: ${s}`
      )
    } catch {
      console.log("signature denied by user")
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
                  {/*
                    Deadline to cash this check, compute 1-month ahead of current timestamp when creating Check,
                    represented as a Unix timestamp (string or number type okay)
                  */}
                  <label htmlFor="name" className="text-marble-white text-base mt-4">
                    Deadline to Cash (unix timestamp)
                  </label>
                  <Field
                    component="input"
                    name="deadline"
                    placeholder="0"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  {/*
                    One-use nonce for this specific check, verified by the contract,
                    individual checks within a bulk approval should have unique nonces
                  */}
                  <label htmlFor="name" className="text-marble-white text-base mt-4">
                    Nonce
                  </label>
                  <Field
                    component="input"
                    name="nonce"
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
              )} ${c.amount} tokens (${truncateString(c.token)}), nonce: ${c.nonce}`}</span>
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
