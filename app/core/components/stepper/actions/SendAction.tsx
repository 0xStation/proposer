import { ProposalRoleType } from "@prisma/client"
import Button from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { useStepperStore } from "../StepperRenderer"

const SendAction = () => {
  const activeRole = useStepperStore((state) => state.activeRole)
  const toggleSendProposalModalOpen = useStore((state) => state.toggleSendProposalModalOpen)

  const actions = {
    [ProposalRoleType.AUTHOR]: (
      <Button onClick={() => toggleSendProposalModalOpen(true)}>Send</Button>
    ),
  }

  if (activeRole && actions[activeRole]) {
    return actions[activeRole]
  } else {
    return <></>
  }
}

export default SendAction
