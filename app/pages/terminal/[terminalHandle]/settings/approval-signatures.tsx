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

// type definitions
const singleCheckTypes: TypedDataTypeDefinition = {
  Check: [
    { name: "recipient", type: "address" },
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
}
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

  const domain: TypedDataSignatureDomain = {
    name: "Checkbook",
    version: "1",
    chainId: 4,
    verifyingContract: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  }

  let {
    data: approveData,
    isSuccess: approveIsSuccess,
    signTypedData: signApprove,
  } = useSignTypedData()

  if (approveIsSuccess && approveData) {
    const { v, r, s } = signatureToRSV(approveData as string)
    console.log(
      `signer: ${activeUser?.address}\nApprove signature\nsignature:${
        approveData as string
      }\nv: ${v}\nr: ${r}\ns: ${s}`
    )
  }

  const approveCheck = (check: Check) => {
    console.log(check)
    signApprove({
      domain,
      types: singleCheckTypes,
      value: check,
    })
  }

  const approveChecks = (checks: Check[]) => {
    console.log(checks)
    signApprove({
      domain,
      types: bulkCheckTypes,
      value: {
        checks,
      },
    })
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
                  <label htmlFor="name" className="text-marble-white text-base mt-4">
                    Recipient
                  </label>
                  <Field
                    component="input"
                    name="recipient"
                    placeholder="0x..."
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  <label htmlFor="name" className="text-marble-white text-base mt-4">
                    Token
                  </label>
                  <Field
                    component="input"
                    name="token"
                    placeholder="0x..."
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  <label htmlFor="name" className="text-marble-white text-base mt-4">
                    Amount
                  </label>
                  <Field
                    component="input"
                    name="amount"
                    placeholder="0"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  <label htmlFor="name" className="text-marble-white text-base mt-4">
                    Deadline
                  </label>
                  <Field
                    component="input"
                    name="deadline"
                    placeholder="0"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
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
                    className="bg-magic-mint text-tunnel-black w-1/2 rounded mt-12 block p-2 hover:opacity-70"
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
            className="bg-magic-mint text-tunnel-black rounded mt-12 block p-2 hover:opacity-70"
            disabled={checkQueue.length === 0}
            onClick={() => {
              try {
                checkQueue.length > 1 ? approveChecks(checkQueue) : approveCheck(checkQueue[0]!)
              } catch (error) {
                console.error(`Error creating account: ${error}`)
                alert("Error applying.")
              }
            }}
          >
            Sign
          </button>
        </section>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

ApprovalSignaturesPage.suppressFirstRenderFlicker = true

export default ApprovalSignaturesPage
