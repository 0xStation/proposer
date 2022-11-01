import { ProposalStatus, Proposal } from "@prisma/client"
import Step, { StepStatus } from "./Step"
import SendAction from "../actions/SendAction"

const SendStep = ({ proposal }: { proposal: Proposal }) => {
  const status = proposal.status === ProposalStatus.DRAFT ? StepStatus.current : StepStatus.complete

  return (
    <Step
      description="Proposal submission"
      status={status}
      options={{ first: true }}
      action={<SendAction />}
    />
  )
}

export default SendStep
