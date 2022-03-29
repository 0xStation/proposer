import { useState, useEffect } from "react"
import { BlitzPage, useQuery, useParam, Routes, Link } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import useStore from "app/core/hooks/useStore"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"

import { useSignTypedData } from "wagmi"
import Button from "app/core/components/Button"

// All properties on a domain are optional
const domain = {
  name: "AppDev Contributors",
  version: "1",
  chainId: 4,
  verifyingContract: "0x4A2De54eee273fb95bC861f71C90E5ee6705f01e",
}

// The named list of all type definitions
const types = {
  Permit: [
    { name: "spender", type: "address" },
    { name: "tokenId", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
}

const value = {
  spender: "0x7ff6363cd3A4E7f9ece98d78Dd3c862bacE2163d",
  tokenId: 1,
  deadline: 1651386627,
}

const splitSignatureToRSV = (signature: string) => {
  const r = "0x" + signature.substring(2).substring(0, 64)
  const s = "0x" + signature.substring(2).substring(64, 128)
  const v = parseInt(signature.substring(2).substring(128, 130), 16)
  return { r, s, v }
}

const NftPermitPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle", "string") as string

  const activeUser = useStore((state) => state.activeUser)
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const [{ data, error, loading }, signTypedData] = useSignTypedData({
    domain,
    types,
    value,
  })

  if (data) {
    console.log("DATA", splitSignatureToRSV(data as string))
  }

  return (
    // <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Initiatives`}>
    <TerminalNavigation>
      <Button onClick={async () => await signTypedData()}> Sign Typed Data </Button>
    </TerminalNavigation>
    // </Layout>
  )
}

NftPermitPage.suppressFirstRenderFlicker = true

export default NftPermitPage
