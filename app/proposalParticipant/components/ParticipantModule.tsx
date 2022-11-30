import { ProposalStatus } from "@prisma/client"
import AccountMediaRow from "app/comment/components/AccountMediaRow"
import useStore from "app/core/hooks/useStore"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { addressRepresentsAccount } from "app/core/utils/addressRepresentsAccount"
import { PROPOSAL_ROLE_APPROVAL_STATUS_MAP } from "app/core/utils/constants"
import { Proposal } from "app/proposal/types"
import { useParticipants } from "../hooks/useParticipants"

const ParticipantRow = ({ proposal, participant }) => {
  const activeUser = useStore((state) => state.activeUser)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)

  const activeUserHasSigned = participant.signatures
    ?.filter((signature) => signature?.proposalVersion === proposal?.version)
    .some((signature) => addressesAreEqual(signature.address, activeUser?.address))

  const userRepresentsParticipant = addressRepresentsAccount(
    activeUser?.address || "",
    participant?.account
  )

  const showApproveButton =
    proposal?.status === ProposalStatus.AWAITING_APPROVAL &&
    userRepresentsParticipant &&
    !activeUserHasSigned

  return (
    <tr className="h-12">
      {/* ACCOUNT */}
      <td>
        <AccountMediaRow account={participant.account} />
      </td>
      {/* APPROVAL */}
      <td>
        {showApproveButton ? (
          <span
            className="cursor-pointer text-electric-violet font-bold"
            onClick={() => toggleProposalApprovalModalOpen(true)}
          >
            Approve
          </span>
        ) : (
          <div className="flex flex-row items-center space-x-1">
            <span
              className={`h-2 w-2 rounded-full ${
                PROPOSAL_ROLE_APPROVAL_STATUS_MAP[participant.approvalStatus]?.color
              }`}
            />
            <div className="font-bold text-xs uppercase tracking-wider">
              {PROPOSAL_ROLE_APPROVAL_STATUS_MAP[participant.approvalStatus]?.copy}
            </div>
          </div>
        )}
      </td>
    </tr>
  )
}

export const ParticipantModule = ({
  proposal,
  className,
}: {
  proposal?: Proposal
  className?: string
}) => {
  const { participants } = useParticipants(proposal?.id)

  return participants ? (
    <div className={`border border-b border-concrete rounded-2xl px-6 py-6 ${className}`}>
      <div className="text-lg font-bold">Participants</div>
      <table className="mt-2">
        <tr>
          <th className="w-full"></th>
          <th className="w-36 text-right"></th>
        </tr>
        <tbody>
          {participants.map((participant, idx) => {
            return <ParticipantRow proposal={proposal} participant={participant} key={idx} />
          })}
        </tbody>
      </table>
    </div>
  ) : (
    // Skeleton loading screen
    <div
      tabIndex={0}
      className={`${className} h-[300px] w-full flex flex-row rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
    />
  )
}

export default ParticipantModule
