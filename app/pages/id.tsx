import { useSignTypedData } from "wagmi"
import { BlitzPage } from "blitz"
import { Field, Form } from "react-final-form"
import Button from "app/core/components/Button"
import useStore from "app/core/hooks/useStore"
import Layout from "app/core/layouts/Layout"
import { TypedDataTypeDefinition, TypedDataSignatureDomain } from "app/types"

const signatureToRSV = (signature: string) => {
  const r = "0x" + signature.substring(2).substring(0, 64)
  const s = "0x" + signature.substring(2).substring(64, 128)
  const v = parseInt(signature.substring(2).substring(128, 130), 16)
  return { r, s, v }
}

// The named list of all type definitions
const mintTypes: TypedDataTypeDefinition = {
  Mint: [
    { name: "to", type: "address" },
    { name: "deadline", type: "uint256" },
  ],
}

const recoverTypes: TypedDataTypeDefinition = {
  Recover: [
    { name: "tokenId", type: "uint256" },
    { name: "to", type: "address" },
    { name: "deadline", type: "uint256" },
  ],
}

const IdConsolePage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)

  const domain: TypedDataSignatureDomain = {
    name: "",
    version: "1",
    chainId: 4,
    verifyingContract: "0xa6d043D37A0a28232998C2Ce09dE435B30297754",
  }

  const mintValue = {
    to: "0x016562aA41A8697720ce0943F003141f5dEAe006",
    deadline: 2651769430,
  }

  const recoverValue = {
    tokenId: "7969960975173386214804117530009790747280859142",
    to: "0x4D75d85D37170A5f9D47275dAF250459D965dff1",
    deadline: 2651769430,
  }

  let {
    data: mintData,
    isError: mintIsError,
    isLoading: mintIsLoading,
    isSuccess: mintIsSuccess,
    signTypedData: signMint,
  } = useSignTypedData({
    domain,
    types: mintTypes,
    value: mintValue,
  })

  let {
    data: recoverData,
    isError: recoverIsError,
    isLoading: recoverIsLoading,
    isSuccess: recoverIsSuccess,
    signTypedData: signRecover,
  } = useSignTypedData({
    domain,
    types: recoverTypes,
    value: recoverValue,
  })

  if (mintIsSuccess && mintData) {
    const { v, r, s } = signatureToRSV(mintData as string)
    console.log(
      `signer: ${activeUser?.address}\nMint signature\nsignature:${
        mintData as string
      }\nv: ${v}\nr: ${r}\ns: ${s}`
    )
  }

  if (recoverIsSuccess && recoverData) {
    const { v, r, s } = signatureToRSV(recoverData as string)
    console.log(
      `signer: ${activeUser?.address}\nRecover signature\nsignature:${
        mintData as string
      }\v: ${v}\nr: ${r}\ns: ${s}`
    )
  }

  const mint = (values: any) => {
    console.log("mint", values)
  }

  return (
    <Layout>
      <Form
        onSubmit={async (values: any) => {
          try {
            mint(values)
          } catch (error) {
            console.error(`Error creating account: ${error}`)
            alert("Error applying.")
          }
        }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <div className="w-1/3 flex flex-col col-span-2 mt-10">
              <label htmlFor="name" className="text-marble-white text-base font-bold">
                Address
              </label>
              <Field
                component="input"
                name="address"
                placeholder="Paste an address you'd like to do something with"
                className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
              />
              <button
                type="submit"
                className="bg-magic-mint text-tunnel-black w-1/3 rounded mt-6 block p-2 hover:opacity-70"
              >
                Mint
              </button>
            </div>
          </form>
        )}
      />
      <div className="w-1/3 flex flex-col col-span-2 mt-10">
        <label htmlFor="name" className="text-marble-white text-base font-bold">
          Signature Utils
        </label>
        <button
          className="bg-magic-mint text-tunnel-black w-1/3 rounded mt-6 block p-2 hover:opacity-70"
          onClick={async () => await signMint()}
        >
          Approve Mint
        </button>
        <button
          className="bg-magic-mint text-tunnel-black w-1/3 rounded mt-6 block p-2 hover:opacity-70"
          onClick={async () => await signRecover()}
        >
          Recover Token
        </button>
      </div>
    </Layout>
  )
}

IdConsolePage.suppressFirstRenderFlicker = true

export default IdConsolePage
