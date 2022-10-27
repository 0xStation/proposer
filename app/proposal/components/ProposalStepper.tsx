import { useState, useEffect } from "react"
import { useParam, useQuery } from "blitz"
import useStore from "app/core/hooks/useStore"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"
import useGetRolesUserCanApprove from "app/core/hooks/useGetRolesUserCanApprove"
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

  const { roles: rolesUserCanApprove } = useGetRolesUserCanApprove(proposalId)
  const { roles: userRoles } = useGetUsersRoles(proposalId)

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
        [ProposalRoleType.CLIENT]: rolesUserCanApprove.filter(
          (role) => role.type === ProposalRoleType.CLIENT
        ).length > 0 && (
          <Button
            type={ButtonType.Secondary}
            isDisabled={Boolean(rfp && rfp?.status === RfpStatus.CLOSED)}
            onClick={() => toggleProposalApprovalModalOpen(true)}
          >
            Approve
          </Button>
        ),
        [ProposalRoleType.CONTRIBUTOR]: rolesUserCanApprove.filter(
          (role) => role.type === ProposalRoleType.CONTRIBUTOR
        ).length > 0 && (
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
  }, [proposal, userRoles, rolesUserCanApprove])

  return (
    <Stepper
      loading={stepperLoading}
      // filter out duplicate roles, e.g. user is a CONTRIBUTOR and a Safe that they are a signer for is also a CONTRIBUTOR
      roles={userRoles?.map((role) => role.type).filter((v, i, roles) => roles.indexOf(v) === i)}
      steps={stepperSteps}
      className="absolute right-[-340px] top-0"
    />
  )
}

export default ProposalStepper
