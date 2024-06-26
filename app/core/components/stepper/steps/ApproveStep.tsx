import { useEffect } from "react"
import { ProposalStatus } from "@prisma/client"
import { Proposal } from "app/proposal/types"
import Step, { StepStatus, StepType } from "./Step"
import ApproveAction from "../actions/ApproveAction"
import { useStepperStore } from "../StepperRenderer"

const ApproveStep = ({ proposal, isLastStep }: { proposal: Proposal; isLastStep: boolean }) => {
  const status =
    proposal.status === ProposalStatus.APPROVED || proposal.status === ProposalStatus.COMPLETE
      ? StepStatus.COMPLETE
      : proposal.status === ProposalStatus.DRAFT
      ? StepStatus.UPCOMING
      : StepStatus.CURRENT
  const setActiveStep = useStepperStore((state) => state.setActiveStep)

  useEffect(() => {
    if (status === StepStatus.CURRENT) {
      setActiveStep(StepType.APPROVE)
    }
  }, [status])

  return (
    <Step
      description="Proposal approved by signers"
      subtitle="Approvals from all signers are required to activate the proposal."
      status={status}
      isLastStep={isLastStep}
      action={<ApproveAction proposal={proposal} />}
    />
  )
}

export default ApproveStep
