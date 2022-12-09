import { ProposalRoleType } from "@prisma/client"
import { AccountPill } from "app/account/components/AccountPill"
import { useAccount } from "app/account/hooks/useAccount"
import { ChangeParticipantType } from "../types"

export const ParticipantDiff = ({
  participants,
}: {
  participants?: {
    address: string
    changeType: ChangeParticipantType
    roleType: ProposalRoleType
  }[]
}) => {
  const ParticipantRow = ({ participant }) => {
    const { account } = useAccount(participant.address)

    const message = `${
      participant.changeType === ChangeParticipantType.ADDED
        ? "was added to the"
        : "was removed from the"
    } ${participant.roleType.toLowerCase()} list`
    return (
      <div className="mt-2 flex flex-row space-x-2 items-center">
        <AccountPill account={account} />
        <span className="text-concrete-115">{message}</span>
      </div>
    )
  }
  return (
    <>
      {participants && (
        <div className="mt-6">
          <label className="uppercase text-xs font-bold text-concrete tracking-wider">
            Participants
          </label>
          <div className="mt-2"></div>
          {participants.map((participant, idx) => {
            return <ParticipantRow participant={participant} key={idx} />
          })}
        </div>
      )}
    </>
  )
}
