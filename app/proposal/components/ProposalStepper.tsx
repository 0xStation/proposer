import { useState, useEffect } from "react"
import useStore from "app/core/hooks/useStore"
import useGetUsersRolesToSignFor from "app/core/hooks/useGetUsersRolesToSignFor"
import Button from "app/core/components/sds/buttons/Button"
import { ProposalRoleType, ProposalStatus } from "@prisma/client"
import Stepper, { StepStatus } from "app/core/components/Stepper"

const ProposalStepper = ({ proposal }) => {
  const activeUser = useStore((state) => state.activeUser)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)
  const toggleSendProposalModalOpen = useStore((state) => state.toggleSendProposalModalOpen)
  const [stepperSteps, setStepperSteps] = useState<any>([])
  const [stepperLoading, setStepperLoading] = useState<boolean>(true)
  const [remainingRoles, signedRoles, _error, loading] = useGetUsersRolesToSignFor(proposal)
  const activeUserIsSigner = signedRoles.length + remainingRoles.length > 0
  const activeUserHasRolesToSign = remainingRoles.length > 0
  const authorRoles =
    proposal?.roles?.filter((role) => {
      return role.type === ProposalRoleType.AUTHOR && role.address === activeUser?.address
    }) || []

  const usersRoles = [...remainingRoles, ...signedRoles, ...authorRoles].map(
    (role) => role.type
  ) as ProposalRoleType[]

  const rawSteps = [
    {
      description: "Author sends proposal",
      status: proposal
        ? proposal.status === ProposalStatus.DRAFT
          ? StepStatus.current
          : StepStatus.complete
        : StepStatus.loading,
      actions: {
        [ProposalRoleType.AUTHOR]: (
          <Button onClick={() => toggleSendProposalModalOpen(true)}>Send</Button>
        ),
      },
    },
    {
      description: "Client, contributor, and author approve the proposal",
      status: proposal
        ? proposal.status === "APPROVED"
          ? StepStatus.complete
          : proposal.status === "DRAFT"
          ? StepStatus.upcoming
          : StepStatus.current
        : StepStatus.loading,
      actions: {
        [ProposalRoleType.CLIENT]: activeUserHasRolesToSign && (
          <Button onClick={() => toggleProposalApprovalModalOpen(true)}>Approve</Button>
        ),
        [ProposalRoleType.CONTRIBUTOR]: activeUserHasRolesToSign && (
          <Button onClick={() => toggleProposalApprovalModalOpen(true)}>Approve</Button>
        ),
      },
    },
  ]

  useEffect(() => {
    if (proposal) {
      setStepperSteps(rawSteps)
      setStepperLoading(false)
    }
  }, [proposal, activeUserHasRolesToSign, activeUserIsSigner])

  return (
    <Stepper
      loading={stepperLoading}
      roles={usersRoles}
      steps={stepperSteps}
      className="absolute right-[-340px] top-0"
    />
  )
}

export default ProposalStepper
