import { useQuery } from "@blitzjs/rpc"
import AccountMediaRow from "app/comment/components/AccountMediaRow"
import { PROPOSAL_ROLE_APPROVAL_STATUS_MAP } from "app/core/utils/constants"
import { Proposal } from "app/proposal/types"
import getParticipantsByProposal from "../queries/getParticipantsByProposal"

export const ParticipantModule = ({
  proposal,
  className,
}: {
  proposal?: Proposal
  className?: string
}) => {
  const [participants] = useQuery(
    getParticipantsByProposal,
    { proposalId: proposal?.id as string },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: Boolean(proposal?.id),
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return participants ? (
    <div className={`border border-b border-concrete rounded-2xl px-6 py-6 ${className}`}>
      <div className="text-lg font-bold">Participants</div>
      <table className="mt-2">
        <tr>
          <th className="w-full text-sm font-light text-concrete text-left">Participant</th>
          <th className="w-36"></th>
        </tr>
        <tbody>
          {participants.map((participant, idx) => {
            return (
              <tr className="h-12" key={idx}>
                <td>
                  <AccountMediaRow account={participant.account} />
                </td>
                <td>
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
                </td>
              </tr>
            )
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
