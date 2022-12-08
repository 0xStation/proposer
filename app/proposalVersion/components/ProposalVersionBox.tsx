import {
  ChangeParticipantType,
  ProposalVersion,
  ProposalVersionMetadata,
} from "app/proposalVersion/types"
import { DateTime } from "luxon"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import { useAccount } from "app/account/hooks/useAccount"
import { AccountPill } from "app/account/components/AccountPill"
import { ModuleBox } from "app/core/components/ModuleBox"

const ParticipantsMetadata = ({ participants }) => {
  const ParticipantRow = ({ participant }) => {
    const { account } = useAccount(participant.address)

    const message = `${
      participant.changeType === ChangeParticipantType.ADDED
        ? "was added to the"
        : "is no longer on the"
    } ${participant.roleType.toLowerCase()} team`
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

export const ProposalVersionBox = ({
  proposalVersion,
  className,
}: {
  proposalVersion: ProposalVersion
  className?: string
}) => {
  const { text: editorDisplayName } = useDisplayAddress(proposalVersion?.editorAddress)
  return (
    <ModuleBox isLoading={!proposalVersion} className="mt-6">
      {/* GENERAL METADATA */}
      <label className="uppercase text-xs font-bold text-concrete tracking-wider">
        Version {proposalVersion.version}
      </label>
      <p className="text-concrete-115 mt-4">
        Edited by {editorDisplayName} on{" "}
        {/* DATETIME_FULL formatting example: 'April 20, 2017 at 11:32 AM EDT' */}
        {DateTime.fromJSDate(proposalVersion?.createdAt as Date).toLocaleString(
          DateTime.DATETIME_FULL
        )}
      </p>
      {/* CHANGE NOTES */}
      {proposalVersion?.data?.content?.body && (
        <div className="mt-6">
          <label className="uppercase text-xs font-bold text-concrete tracking-wider">
            Note from {editorDisplayName}
          </label>
          <p className="mt-4">
            &quot;{(proposalVersion?.data as ProposalVersionMetadata)?.content?.body}&quot;
          </p>
        </div>
      )}
      {/* PARTICIPANTS */}
      <ParticipantsMetadata participants={proposalVersion?.data?.changes?.participants} />
    </ModuleBox>
  )
}

export default ProposalVersionBox
