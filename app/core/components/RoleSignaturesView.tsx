import { ProposalRoleType } from "@prisma/client"
import { useQuery } from "blitz"
import { useState } from "react"
import getProposalNewSignaturesById from "app/proposalNew/queries/getProposalNewSignaturesById"
import { ProposalNew } from "app/proposalNew/types"
import { RoleSignature } from "./RoleSignature"

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
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )

  return (
    <>
      <div className={`border border-b border-concrete rounded-2xl px-6 py-9 ${className}`}>
        {/* CONTRIBUTOR */}
        <h4 className="text-xs font-bold text-concrete uppercase mb-2">Contributor</h4>
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
    </>
  )
}

export default RoleSignaturesView
