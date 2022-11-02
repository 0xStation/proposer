import { useEffect } from "react"
import { ProposalRoleType } from "@prisma/client"
import Button from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { useStepperStore } from "../StepperRenderer"
import { StepType } from "../steps/Step"

const SendAction = () => {
  const activeRole = useStepperStore((state) => state.activeRole)
  const toggleSendProposalModalOpen = useStore((state) => state.toggleSendProposalModalOpen)
  const setActions = useStepperStore((state) => state.setActions)

  const actions = {
    [ProposalRoleType.AUTHOR]: (
      <Button onClick={() => toggleSendProposalModalOpen(true)}>Send</Button>
    ),
  }

  useEffect(() => {
    setActions({
      step: StepType.PAYMENT,
      actions: actions,
    })
  }, [actions])

  return activeRole && actions[activeRole] ? actions[activeRole] : null
}

export default SendAction
