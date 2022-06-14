import { BlitzPage } from "blitz"
import { useSignTypedData } from "wagmi"
import Navigation from "app/terminal/components/settings/navigation"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import { TypedDataTypeDefinition, TypedDataSignatureDomain } from "app/types"
import { CoPresentSharp } from "@mui/icons-material"

const signatureToRSV = (signature: string) => {
  const r = "0x" + signature.substring(2).substring(0, 64)
  const s = "0x" + signature.substring(2).substring(64, 128)
  const v = parseInt(signature.substring(2).substring(128, 130), 16)
  return { r, s, v }
}

// The named list of all type definitions
const approveTypes: TypedDataTypeDefinition = {
  Check: [
    { name: "nonce", type: "uint256" },
    { name: "recipient", type: "address" },
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
  ],
  //   SingleApproval: [
  //     { name: "check", type: "Check" },
  //     { name: "deadline", type: "uint256" },
  //   ],
  //   BulkApproval: [
  //     { name: "checks", type: "Check[]" },
  //     { name: "deadline", type: "uint256" },
  //   ],
}

const SignatureTestingPage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)

  const domain: TypedDataSignatureDomain = {
    name: "Checkbook",
    version: "1",
    chainId: 4,
    verifyingContract: "0xa6d043D37A0a28232998C2Ce09dE435B30297754",
  }

  const checkValue = {
    nonce: 1,
    recipient: "0x016562aA41A8697720ce0943F003141f5dEAe006",
    token: "0x016562aA41A8697720ce0943F003141f5dEAe006",
    amount: 1000,
    deadline: 2651769430,
  }

  let {
    data: approveData,
    isError: approveIsError,
    isLoading: approveIsLoading,
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

  const approve = (values: any) => {
    signApprove({
      domain,
      types: approveTypes,
      value: { ...values, deadline: 2651769430 },
    })
  }

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <section className="flex-1">
          <Form
            onSubmit={async (values: any) => {
              try {
                approve(values)
              } catch (error) {
                console.error(`Error creating account: ${error}`)
                alert("Error applying.")
              }
            }}
            render={({ handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <div className="w-1/3 flex flex-col col-span-2 mt-10">
                  <label htmlFor="name" className="text-marble-white text-base font-bold">
                    Recipient
                  </label>
                  <Field
                    component="input"
                    name="recipient"
                    placeholder="Paste an address you'd like to do something with"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  <label htmlFor="name" className="text-marble-white text-base font-bold">
                    Token
                  </label>
                  <Field
                    component="input"
                    name="token"
                    placeholder="Paste an address you'd like to do something with"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  <label htmlFor="name" className="text-marble-white text-base font-bold">
                    Amount
                  </label>
                  <Field
                    component="input"
                    name="amount"
                    placeholder="Paste an address you'd like to do something with"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  <label htmlFor="name" className="text-marble-white text-base font-bold">
                    Nonce
                  </label>
                  <Field
                    component="input"
                    name="nonce"
                    placeholder="Paste an address you'd like to do something with"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                  <button
                    type="submit"
                    className="bg-magic-mint text-tunnel-black w-1/3 rounded mt-6 block p-2 hover:opacity-70"
                  >
                    Approve
                  </button>
                </div>
              </form>
            )}
          />
        </section>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

SignatureTestingPage.suppressFirstRenderFlicker = true

export default SignatureTestingPage
