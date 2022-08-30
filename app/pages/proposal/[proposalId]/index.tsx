import { BlitzPage, Link, Routes, useMutation, useQuery, useParam } from "blitz"
import { useEffect, useState } from "react"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import getProposalNewById from "app/proposalNew/queries/getProposalNewById"
import { getNetworkName } from "app/core/utils/getNetworkName"
import { ProposalRoleType } from "@prisma/client"
import truncateString from "app/core/utils/truncateString"
import ApproveProposalNewModal from "app/proposalNew/components/ApproveProposalNewModal"
import ExecutePaymentModal from "app/proposalNew/components/ExecutePaymentModal"
import TransactionLink from "app/core/components/TransactionLink"
import ProgressIndicator from "app/core/components/ProgressIndicator"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"

const ViewProposalNew: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [isApproveProposalModalOpen, setIsApproveProposalModalOpen] = useState<boolean>(false)
  const [isExecutePaymentModalOpen, setIsExecutePaymentModalOpen] = useState<boolean>(false)
  const [isActionPending, setIsActionPending] = useState<boolean>(false)
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
        <p className="mr-4">{truncateString(role?.address)}</p>
        <div className="flex flex-row items-center space-x-1 ml-4">
          <span
            className={`h-2 w-2 rounded-full bg-${
              addressHasSigned(role?.address) ? "magic-mint" : "neon-carrot"
            }`}
          />
          <div className="font-bold text-xs uppercase tracking-wider">
            {addressHasSigned(role?.address) ? "signed" : "pending"}
          </div>
        </div>
      </div>
    )
  }

  const userHasRole = proposal?.roles.some((role) =>
    addressesAreEqual(activeUser?.address || "", role.address)
  )
  const userHasSigned = proposal?.data.commitments.some((commitment) =>
    addressesAreEqual(activeUser?.address || "", commitment.address)
  )
  const userIsPayer = proposal?.roles.some(
    (role) =>
      role.role === ProposalRoleType.CLIENT &&
      addressesAreEqual(activeUser?.address || "", role.address)
  )
  const commitmentsComplete = (() => {
    const requiredSignatures = {}

    proposal?.roles.forEach((role) => {
      requiredSignatures[role.address] = false
    })

    proposal?.data.commitments.forEach((commitment) => {
      requiredSignatures[commitment.address] = true
    })

    return Object.values(requiredSignatures).every((hasSigned) => hasSigned)
  })()

  const paymentComplete = !!proposal?.data?.payments?.[0]?.transactionHash

  const showApproveButton = userHasRole && !userHasSigned
  const showPayButton = commitmentsComplete && userIsPayer && !paymentComplete

  const uniqueRoleAddresses = (proposal?.roles || [])
    .map((role) => toChecksumAddress(role.address))
    .filter((v, i, addresses) => addresses.indexOf(v) === i).length
  const signatureCount = proposal?.data.commitments.length || 0

  return (
    <Layout title="View Proposal">
      <ApproveProposalNewModal
        isOpen={isApproveProposalModalOpen}
        setIsOpen={setIsApproveProposalModalOpen}
        proposal={proposal}
      />
      <ExecutePaymentModal
        isOpen={isExecutePaymentModalOpen}
        setIsOpen={setIsExecutePaymentModalOpen}
        isLoading={isActionPending}
        setIsLoading={setIsActionPending}
        payment={proposal?.data?.payments?.[0]}
        proposalId={proposal?.id}
      />
      <div className="flex flex-row mt-16">
        <h2 className="ml-10 text-marble-white text-xl font-bold w-full">
          {proposal?.data.content.title}
        </h2>
        {showApproveButton && (
          <div className="relative self-start group mr-10">
            <Button
              type={ButtonType.Primary}
              isLoading={isActionPending}
              isDisabled={isActionPending}
              onClick={() => {
                setIsApproveProposalModalOpen(true)
              }}
            >
              Approve
            </Button>
          </div>
        )}
        {showPayButton && (
          <div className="relative self-start group mr-10">
            <Button
              type={ButtonType.Primary}
              isLoading={isActionPending}
              isDisabled={isActionPending}
              onClick={() => {
                setIsExecutePaymentModalOpen(true)
              }}
            >
              Pay
            </Button>
          </div>
        )}
      </div>
      <div className="ml-10 mt-10 grow flex flex-row overflow-y-scroll">
        <p className="mt-6 w-full font-normal">{proposal?.data.content.body}</p>
        <div className="flex-col overflow-y-scroll">
          <div className="w-[36rem] flex-col overflow-y-scroll ml-12">
            {/* STATUS */}
            <h4 className="text-xs font-bold text-concrete uppercase mt-6">Proposal status</h4>
            <div className="flex flex-row space-x-2">
              <p className="mt-2 font-normal">
                {paymentComplete
                  ? "PAID"
                  : commitmentsComplete
                  ? "APPROVED"
                  : "AWAITING SIGNATURES"}
              </p>
              {paymentComplete ? (
                <TransactionLink
                  className="mt-3"
                  chainId={proposal?.data?.payments?.[0]?.token.chainId}
                  txnHash={proposal?.data?.payments?.[0]?.transactionHash}
                />
              ) : (
                <ProgressCircleAndNumber
                  numerator={signatureCount}
                  denominator={uniqueRoleAddresses}
                />
              )}
            </div>
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
