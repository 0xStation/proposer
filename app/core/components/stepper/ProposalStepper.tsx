import { useQuery } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import getProposalById from "app/proposal/queries/getProposalById"
import StepperRenderer from "./StepperRenderer"
import SendStep from "./steps/SendStep"
import ApproveStep from "./steps/ApproveStep"
import PaymentStep from "./steps/PaymentStep"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"

const ProposalStepper = () => {
  const proposalId = useParam("proposalId") as string

  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      enabled: Boolean(proposalId),
      staleTime: 500,
    }
  )

  const { roles: userRoles } = useGetUsersRoles(proposalId)
  const userRoleTypes = userRoles.map((role) => role.type)

  return (
    <StepperRenderer activeUserRoles={userRoleTypes} className="absolute right-[-340px] top-0">
      {proposal && (
        <>
          <SendStep proposal={proposal} />
          <ApproveStep proposal={proposal} />
          {proposal.milestones?.map((milestone, idx) => (
            <PaymentStep
              key={`milestone-${idx}`}
              milestone={milestone}
              proposal={proposal}
              isLastStep={idx === (proposal.milestones ? proposal.milestones.length - 1 : 0)}
            />
          ))}
        </>
      )}
    </StepperRenderer>
  )
}

export default ProposalStepper
