import { ProposalRoleType, ProposalStatus, Proposal } from "@prisma/client"
import Button from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import Step, { StepStatus } from "./Step"

const SendStep = ({ proposal }: { proposal: Proposal }) => {
  const status = proposal.status === ProposalStatus.DRAFT ? StepStatus.current : StepStatus.complete
  const toggleSendProposalModalOpen = useStore((state) => state.toggleSendProposalModalOpen)

  const actions = {
    [ProposalRoleType.AUTHOR]: (
      <Button onClick={() => toggleSendProposalModalOpen(true)}>Send</Button>
    ),
  }

  return (
    <Step description="Send proposal" status={status} options={{ first: true }} actions={actions} />
  )
}

export default SendStep
