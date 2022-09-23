import { ProposalRoleType } from "@prisma/client"
import { useQuery } from "blitz"
import { ProposalNew } from "app/proposalNew/types"
import { RoleSignature } from "./RoleSignature"
import getProposalNewSignaturesById from "app/proposalNew/queries/getProposalNewSignaturesById"

export const RoleSignaturesView = ({
  proposal,
  className,
}: {
  proposal?: ProposalNew
  className?: string
}) => {
  const [signatures] = useQuery(
    getProposalNewSignaturesById,
    { proposalId: proposal?.id as string },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: Boolean(proposal?.id),
    }
  )

  return proposal ? (
    <div className={`border border-b border-concrete rounded-2xl px-6 py-9 ${className}`}>
      <h2 className="font-bold text-xl">Collaborators</h2>
      {/* CONTRIBUTOR */}
      <h4 className="text-xs font-bold text-concrete uppercase mt-6 mb-2">Contributor</h4>
      <RoleSignature
        role={proposal?.roles?.find((role) => role.role === ProposalRoleType.CONTRIBUTOR)}
        signatures={signatures}
      />
      {/* CLIENT */}
      <h4 className="text-xs font-bold text-concrete uppercase mb-2 mt-6">Reviewer</h4>
      <RoleSignature
        role={proposal?.roles?.find((role) => role.role === ProposalRoleType.CLIENT)}
        signatures={signatures}
      />
      {/* AUTHOR */}
      <h4 className="text-xs font-bold text-concrete uppercase mb-2 mt-6">Author</h4>
      <RoleSignature
        role={proposal?.roles?.find((role) => role.role === ProposalRoleType.AUTHOR)}
        signatures={signatures}
      />
    </div>
  ) : (
    // Skeleton loading screen
    <div
      tabIndex={0}
      className={`${className} h-[300px] w-full flex flex-row rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
    />
  )
}

export default RoleSignaturesView
