import { ProposalStatus } from "@prisma/client"
import { Proposal } from "app/proposal/types"
import Step, { StepStatus } from "./Step"
import ApproveAction from "../actions/ApproveAction"

const ApproveStep = ({ proposal }: { proposal: Proposal }) => {
  const status =
    proposal.status === ProposalStatus.APPROVED || proposal.status === ProposalStatus.COMPLETE
      ? StepStatus.complete
      : proposal.status === ProposalStatus.DRAFT
      ? StepStatus.upcoming
      : StepStatus.current

  return (
    <Step
      description="Proposal approved by signers"
      subtitle="Approvals from all signers are required to activate the proposal."
      status={status}
      action={<ApproveAction proposal={proposal} />}
    />
  )
}

export default ApproveStep
