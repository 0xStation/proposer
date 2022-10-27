import { ProposalRoleType, Proposal } from "@prisma/client"
import { useParam, useQuery } from "blitz"
import getProposalById from "app/proposal/queries/getProposalById"
import useStore from "app/core/hooks/useStore"
import StepperRenderer from "./StepperRenderer"
import SendStep from "./steps/SendStep"
import ApproveStep from "./steps/ApproveStep"
import PaymentStep from "./steps/PaymentStep"
import useGetUsersRolesToSignFor from "app/core/hooks/useGetUsersRolesToSignFor"
// import { useStepperStore } from "./StepperRenderer"

const ProposalStepper = () => {
  const activeUser = useStore((state) => state.activeUser)
  const proposalId = useParam("proposalId") as string

  // fetch and set proposal in data
  // not actually used in this component
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      enabled: Boolean(proposalId),
      staleTime: 500,
      onSuccess: (data) => {
        // setProposal(data)
      },
    }
  )

  // everything below can get removed when we merge syms PR
  const [remainingRoles, signedRoles, _error, loading] = useGetUsersRolesToSignFor(proposal)
  const authorRoles =
    proposal?.roles?.filter((role) => {
      return role.type === ProposalRoleType.AUTHOR && role.address === activeUser?.address
    }) || []

  const usersRoles = [...remainingRoles, ...signedRoles, ...authorRoles].map(
    (role) => role.type
  ) as ProposalRoleType[]
  // end of stuff that can get removed

  return (
    <StepperRenderer activeUserRoles={usersRoles} className="absolute right-[-340px] top-0">
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
