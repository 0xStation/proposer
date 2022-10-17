import { useState, useEffect } from "react"
import { BlitzPage, useQuery, useParam, GetServerSideProps, invoke } from "blitz"
import Layout from "app/core/layouts/Layout"
import getProposalById from "app/proposal/queries/getProposalById"
import { ProposalViewHeaderNavigation } from "app/proposal/components/viewPage/ProposalViewHeaderNavigation"
import ReadMore from "app/core/components/ReadMore"
import { TotalPaymentView } from "app/core/components/TotalPaymentView"
import RoleSignaturesView from "app/core/components/RoleSignaturesView"
import { Proposal } from "app/proposal/types"
import ProposalStepper from "app/proposal/components/Stepper"
import useStore from "app/core/hooks/useStore"
import useGetUsersRolesToSignFor from "app/core/hooks/useGetUsersRolesToSignFor"
import Button from "app/core/components/sds/buttons/Button"
import { ProposalRoleType } from "@prisma/client"

export const getServerSideProps: GetServerSideProps = async ({ params = {} }) => {
  const { proposalId } = params
  // regex checks if a string is a uuid
  // https://melvingeorge.me/blog/check-if-string-valid-uuid-regex-javascript
  const isUuidRegex =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi

  if (!proposalId || !isUuidRegex.test(proposalId as string)) {
    return {
      notFound: true,
    }
  }

  const proposal = await invoke(getProposalById, {
    id: proposalId,
  })

  if (!proposal) {
    return {
      notFound: true,
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
}

const ViewProposal: BlitzPage = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )

  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)
  const toggleSendProposalModalOpen = useStore((state) => state.toggleSendProposalModalOpen)
  const [stepperSteps, setStepperSteps] = useState<any>([])
  const [stepperLoading, setStepperLoading] = useState<boolean>(true)

  const [remainingRoles, signedRoles, _error, loading] = useGetUsersRolesToSignFor(proposal)
  const activeUserIsSigner = signedRoles.length + remainingRoles.length > 0
  const activeUserHasRolesToSign = remainingRoles.length > 0
  const usersRoles = [...remainingRoles, ...signedRoles].map(
    (role) => role.type
  ) as ProposalRoleType[]

  const rawSteps = [
    {
      description: "Author sends proposal",
      status: proposal ? (proposal.status === "DRAFT" ? "current" : "complete") : "loading",
      actions: {
        [ProposalRoleType.AUTHOR]: (
          <Button onClick={() => toggleSendProposalModalOpen(true)}>Send</Button>
        ),
      },
    },
    {
      description: "Client, contributor, and author approve the proposal",
      status: proposal
        ? proposal.status === "APPROVED"
          ? "complete"
          : proposal.status === "DRAFT"
          ? "upcoming"
          : "current"
        : "loading",
      actions: {
        [ProposalRoleType.CLIENT]: activeUserHasRolesToSign ? (
          <Button onClick={() => toggleProposalApprovalModalOpen(true)}>Approve</Button>
        ) : (
          <Button isDisabled={true}>Approved</Button>
        ),
        [ProposalRoleType.CONTRIBUTOR]: activeUserHasRolesToSign ? (
          <Button onClick={() => toggleProposalApprovalModalOpen(true)}>Approve</Button>
        ) : (
          <Button isDisabled={true}>Approved</Button>
        ),
      },
    },
  ]

  useEffect(() => {
    if (proposal) {
      setStepperSteps(rawSteps)
      setStepperLoading(false)
    }
  }, [proposal, activeUserHasRolesToSign, activeUserIsSigner])

  return (
    <Layout title="View Proposal">
      <div className="w-full md:min-w-1/2 md:max-w-2xl mx-auto pb-9 relative">
        <ProposalStepper
          loading={stepperLoading}
          roles={usersRoles}
          steps={stepperSteps}
          className="absolute right-[-340px] top-0"
        />
        <ProposalViewHeaderNavigation />
        <ReadMore className="mt-9 mb-9">{proposal?.data?.content?.body}</ReadMore>
        <RoleSignaturesView proposal={proposal as Proposal} className="mt-9" />
        {(proposal?.data.totalPayments || []).length > 0 && (
          <TotalPaymentView proposal={proposal!} className="mt-9" />
        )}
      </div>
    </Layout>
  )
}

ViewProposal.suppressFirstRenderFlicker = true

export default ViewProposal
