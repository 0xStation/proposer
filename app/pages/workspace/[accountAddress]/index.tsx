import { useState, useEffect } from "react"
import { BlitzPage, useParam, useQuery, Routes, Link, Image, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import Button from "app/core/components/sds/buttons/Button"
import getAccountProposalsByAddress from "app/account/queries/getAccountProposalsByAddress"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

const WorkspaceHome: BlitzPage = () => {
  const accountAddress = useParam("accountAddress", "string") as string
  const [accountProposals] = useQuery(
    getAccountProposalsByAddress,
    { address: toChecksumAddress(accountAddress) },
    { enabled: !!accountAddress, suspense: false, refetchOnWindowFocus: false }
  )

  console.log(accountProposals)

  return (
    <Layout>
      <div className="flex flex-row h-full">
        <div className="h-full w-[288px] border-r border-concrete p-6">
          <div className="pb-6 border-b border-concrete space-y-6">
            <p>pfp</p>
            <Button className="w-full">Propose</Button>
          </div>
          <ul className="mt-6">
            <li className="font-bold bg-wet-concrete p-1 pl-4 rounded">Proposals</li>
            <li className="font-bold p-1 pl-4 rounded">Settings</li>
          </ul>
        </div>
        <div className="p-10">
          <h1 className="text-2xl">Propose</h1>
        </div>
      </div>
    </Layout>
  )
}

WorkspaceHome.suppressFirstRenderFlicker = true
export default WorkspaceHome
