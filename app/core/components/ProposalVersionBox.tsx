import { ProposalVersion } from "@prisma/client"
import { ProposalVersionMetadata } from "app/proposalVersion/types"
import { DateTime } from "luxon"
import useDisplayAddress from "../hooks/useDisplayAddress"

export const ProposalVersionBox = ({
  proposalVersion,
  className,
}: {
  proposalVersion: ProposalVersion
  className?: string
}) => {
  const { text: editorDisplayName } = useDisplayAddress(proposalVersion?.editorAddress)
  return (
    <div className={`border border-b border-concrete rounded-2xl mt-6 px-6 py-9 ${className}`}>
      <label className="uppercase text-sm font-bold text-concrete tracking-wider">Changes</label>
      <h1 className="mt-4">{(proposalVersion?.data as ProposalVersionMetadata)?.content?.title}</h1>
      <p className="text-concrete mt-1 mb-2">
        Edited by {editorDisplayName} on{" "}
        {/* DATETIME_FULL formatting example: 'April 20, 2017 at 11:32 AM EDT' */}
        {DateTime.fromJSDate(proposalVersion?.createdAt as Date).toLocaleString(
          DateTime.DATETIME_FULL
        )}
      </p>
      {(proposalVersion?.data as ProposalVersionMetadata)?.content?.body && (
        <div className="mt-4">
          <label className="uppercase text-sm font-bold text-concrete tracking-wider">
            Note from {editorDisplayName}
          </label>
          <p className="mt-4">
            &quot;{(proposalVersion?.data as ProposalVersionMetadata)?.content?.body}&quot;
          </p>
        </div>
      )}
    </div>
  )
}

export default ProposalVersionBox
