import { BlitzPage, Link, Routes, useMutation, useQuery, useParam } from "blitz"
import { useEffect, useState } from "react"
import Layout from "app/core/layouts/Layout"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { parseUniqueAddresses } from "app/core/utils/parseUniqueAddresses"
import { SUPPORTED_CHAINS, ETH_METADATA } from "app/core/utils/constants"
import networks from "app/utils/networks.json"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import getProposalNewById from "app/proposalNew/queries/getProposalNewById"
import { getNetworkName } from "app/core/utils/getNetworkName"
import { ProposalRoleType } from "@prisma/client"
import truncateString from "app/core/utils/truncateString"

const ViewProposalNew: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalNewById,
    { id: proposalId },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )

  const RoleSignature = ({ role }) => {
    const addressHasSigned = (address: string) => {
      return (
        proposal?.data.commitments.some((commitment) =>
          addressesAreEqual(address, commitment.address)
        ) || false
      )
    }

    return (
      <div className="flex flex-row">
        <p className="mr-4">{truncateString(role.address)}</p>
        <div className="flex flex-row items-center space-x-1 ml-4">
          <span
            className={`h-2 w-2 rounded-full bg-${
              addressHasSigned(role.address) ? "magic-mint" : "neon-carrot"
            }`}
          />
          <div className="font-bold text-xs uppercase tracking-wider">
            {addressHasSigned(role.address) ? "signed" : "pending"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout title="View Proposal">
      <div className="flex flex-row mt-16">
        <h2 className="ml-10 text-marble-white text-xl font-bold w-full">
          {proposal?.data.content.title}
        </h2>
        <div className="relative self-start group mr-10">
          <Button
            type={ButtonType.Primary}
            onClick={() => {
              console.log("approve")
            }}
          >
            Approve
          </Button>
        </div>
      </div>
      <div className="ml-10 mt-10 grow flex flex-row overflow-y-scroll">
        <p className="mt-6 w-full font-normal">{proposal?.data.content.body}</p>
        <div className="flex-col overflow-y-scroll">
          <div className="w-[36rem] flex-col overflow-y-scroll ml-12">
            {/* AUTHOR */}
            <h4 className="text-xs font-bold text-concrete uppercase mt-6">Author</h4>
            <RoleSignature
              role={proposal?.roles?.find((role) => role.role === ProposalRoleType.AUTHOR)}
            />
            {/* CONTRIBUTOR */}
            <h4 className="text-xs font-bold text-concrete uppercase mt-6">Contributor</h4>
            <RoleSignature
              role={proposal?.roles?.find((role) => role.role === ProposalRoleType.CONTRIBUTOR)}
            />
            {/* CLIENT */}
            <h4 className="text-xs font-bold text-concrete uppercase mt-6">Client</h4>
            <RoleSignature
              role={proposal?.roles?.find((role) => role.role === ProposalRoleType.CLIENT)}
            />
            {/* NETWORK */}
            <h4 className="text-xs font-bold text-concrete uppercase mt-6">Network</h4>
            <p className="mt-2 font-normal">
              {getNetworkName(proposal?.data?.payments?.[0]?.token.chainId || 0)}
            </p>
            {/* TOKEN */}
            <h4 className="text-xs font-bold text-concrete uppercase mt-6">Token</h4>
            <p className="mt-2 font-normal">{proposal?.data?.payments?.[0]?.token.symbol}</p>
            {/* PAYMENT AMOUNT */}
            <h4 className="text-xs font-bold text-concrete uppercase mt-6">Payment Amount</h4>
            <p className="mt-2 font-normal">{proposal?.data?.payments?.[0]?.amount}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

ViewProposalNew.suppressFirstRenderFlicker = true

export default ViewProposalNew
