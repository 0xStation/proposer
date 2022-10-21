import { useState, useEffect } from "react"
import { useParam, useQuery } from "blitz"
import useStore from "app/core/hooks/useStore"
import useGetUsersRolesToSignFor from "app/core/hooks/useGetUsersRolesToSignFor"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { ProposalRoleType, ProposalStatus, RfpStatus } from "@prisma/client"
import Stepper, { StepStatus } from "app/core/components/Stepper"
import getProposalById from "../queries/getProposalById"
import getRfpByProposalId from "app/rfp/queries/getRfpByProposalId"

const ProposalStepper = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId },
    { suspense: false, refetchOnWindowFocus: false, enabled: Boolean(proposalId), staleTime: 500 }
  )
  const [rfp] = useQuery(
    getRfpByProposalId,
    { proposalId: proposalId as string },
    { suspense: false, refetchOnWindowFocus: false, enabled: Boolean(proposalId), staleTime: 500 }
  )
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
      description: "Send proposal",
      status: proposal
        ? proposal.status === ProposalStatus.DRAFT
          ? StepStatus.current
          : StepStatus.complete
        : StepStatus.loading,
      actions: {
        [ProposalRoleType.AUTHOR]: (
          <Button
            isDisabled={Boolean(rfp && rfp?.status === RfpStatus.CLOSED)}
            onClick={() => toggleSendProposalModalOpen(true)}
          >
            Send
          </Button>
        ),
      },
    },
    {
      description: "Signers approve proposal",
      subtitle:
        "Reach out to signers on twitter or Discord to get proposals reviewed and approved.",
      status: proposal
        ? proposal.status === ProposalStatus.APPROVED
          ? StepStatus.complete
          : proposal.status === ProposalStatus.DRAFT
          ? StepStatus.upcoming
          : StepStatus.current
        : StepStatus.loading,
      actions: {
        [ProposalRoleType.CLIENT]: activeUserHasRolesToSign && (
          <Button
            type={ButtonType.Secondary}
            isDisabled={Boolean(rfp && rfp?.status === RfpStatus.CLOSED)}
            onClick={() => toggleProposalApprovalModalOpen(true)}
          >
            Approve
          </Button>
        ),
        [ProposalRoleType.CONTRIBUTOR]: activeUserHasRolesToSign && (
          <Button
            type={ButtonType.Secondary}
            isDisabled={Boolean(rfp && rfp?.status === RfpStatus.CLOSED)}
            onClick={() => toggleProposalApprovalModalOpen(true)}
          >
            Approve
          </Button>
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
