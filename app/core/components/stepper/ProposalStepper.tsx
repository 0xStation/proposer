import create from "zustand"
import { ProposalRoleType, Proposal } from "@prisma/client"
import { useParam, useQuery } from "blitz"
import getProposalById from "app/proposal/queries/getProposalById"
import useStore from "app/core/hooks/useStore"
import StepperRenderer from "./StepperRenderer"
import SendStep from "./steps/SendStep"
import ApproveStep from "./steps/ApproveStep"
import PaymentStep from "./steps/PaymentStep"

interface StepperState {
  activeUsersRoles: ProposalRoleType[]
  proposal: Proposal | null
  setActiveUsersRoles: (roles: ProposalRoleType[]) => void
  setProposal: (proposal: Proposal | null) => void
}

const useStepperStore = create<StepperState>((set) => ({
  activeUsersRoles: [],
  proposal: null,
  setActiveUsersRoles: (state) => {
    set(() => {
      return { activeUsersRoles: state }
    })
  },
  setProposal: (state) => {
    set(() => {
      return { proposal: state }
    })
  },
}))

const ProposalStepper = () => {
  const activeUser = useStore((state) => state.activeUser)
  const setProposal = useStepperStore((state) => state.setProposal)

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
        setProposal(data)
      },
    }
  )

  return (
    <StepperRenderer activeUserRoles={[]} className="absolute right-[-340px] top-0">
      {proposal && (
        <>
          <SendStep proposal={proposal} />
          <ApproveStep proposal={proposal} />
          {proposal.milestones?.map((milestone, idx) => (
            <PaymentStep key={`milestone-${idx}`} milestone={milestone} proposal={proposal} />
          ))}
        </>
      )}
    </StepperRenderer>
  )
}

export default ProposalStepper
