import { useEffect } from "react"
import { ProposalStatus, Proposal } from "@prisma/client"
import SendAction from "../actions/SendAction"
import { useStepperStore } from "../StepperRenderer"
import Step, { StepStatus, StepType } from "./Step"

const SendStep = ({ proposal }: { proposal: Proposal }) => {
  const status = proposal.status === ProposalStatus.DRAFT ? StepStatus.CURRENT : StepStatus.COMPLETE
  const setActiveStep = useStepperStore((state) => state.setActiveStep)
  useEffect(() => {
    if (status === StepStatus.CURRENT) {
      setActiveStep(StepType.SEND)
    }
  }, [status])

  return <Step description="Proposal sent" status={status} action={<SendAction />} />
}

export default SendStep
