import { useSignTypedData } from "wagmi"
import { BlitzPage } from "blitz"
import Button from "app/core/components/Button"
import useStore from "app/core/hooks/useStore"
import Layout from "app/core/layouts/Layout"
import { TypedDataTypeDefinition, TypedDataSignatureDomain } from "app/types"
import { BigNumber } from "ethers"

const signatureToRSV = (signature: string) => {
  const r = "0x" + signature.substring(2).substring(0, 64)
  const s = "0x" + signature.substring(2).substring(64, 128)
  const v = parseInt(signature.substring(2).substring(128, 130), 16)
  return { r, s, v }
}

// The named list of all type definitions
const mintTypes: TypedDataTypeDefinition = {
  Mint: [{ name: "to", type: "address" }],
}

const recoverTypes: TypedDataTypeDefinition = {
  Recover: [
    { name: "tokenId", type: "uint256" },
    { name: "to", type: "address" },
    { name: "approver", type: "address" },
  ],
}

const IdConsolePage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)

  const domain: TypedDataSignatureDomain = {
    name: "Station Labs ID",
    version: "1",
    chainId: 1,
    verifyingContract: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
  }

  const mintValue = {
    to: activeUser?.address,
  }

  const recoverValue = {
    tokenId: BigNumber.from("7969960975173386214804117530009790747280859142"),
    to: activeUser?.address,
    approver: activeUser?.address,
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
    console.log(`Mint signature\nv: ${v}\nr: ${r}\ns: ${s}`)

    // clear data
    mintIsSuccess = false
    mintData = ""
  }

  if (recoverIsSuccess && recoverData) {
    const { v, r, s } = signatureToRSV(recoverData as string)
    console.log(`Recover signature\nv: ${v}\nr: ${r}\ns: ${s}`)

    // clear data
    recoverIsSuccess = false
    recoverData = ""
  }

  return (
    <Layout>
      <div className="mt-48">
        <Button onClick={async () => await signMint()}> Approve Mint </Button>
      </div>
      <div className="mt-8">
        <Button onClick={async () => await signRecover()}> Recover Token </Button>
      </div>
    </Layout>
  )
}

IdConsolePage.suppressFirstRenderFlicker = true

export default IdConsolePage
