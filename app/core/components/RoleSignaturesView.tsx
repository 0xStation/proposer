import { ProposalRoleType } from "@prisma/client"
import { useQuery } from "blitz"
import { Proposal } from "app/proposal/types"
import { RoleSignature } from "./RoleSignature"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"

export const RoleSignaturesView = ({
  proposal,
  className,
}: {
  proposal?: Proposal
  className?: string
}) => {
  const [roles] = useQuery(
    getRolesByProposalId,
    { proposalId: proposal?.id as string },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: Boolean(proposal?.id),
      cacheTime: 60 * 1000, // one minute in milliseconds
    }
  )
  const isFundingProposal = proposal?.payments && Boolean(proposal?.payments?.length)

  // This check is needed for old non-funding proposals that have author, contributor, and client
  // instead of just author and client
  const hasContributorRole = roles?.find((role) => role.type === ProposalRoleType.CONTRIBUTOR)

  return roles ? (
    <div className={`border border-b border-concrete rounded-2xl px-6 py-6 ${className}`}>
      {(isFundingProposal || hasContributorRole) && (
        <>
          {/* CONTRIBUTOR */}
          <h4 className="text-xs font-bold text-concrete uppercase mt-2 mb-2">Contributor</h4>
          <RoleSignature
            role={roles?.find((role) => role.type === ProposalRoleType.CONTRIBUTOR)}
            proposalStatus={proposal?.status}
          />
        </>
      )}
      {/* CLIENT */}
      <h4
        className={`text-xs font-bold text-concrete uppercase mb-2 ${
          isFundingProposal ? "mt-6" : "mt-2"
        }`}
      >
        Client
      </h4>
      <RoleSignature
        role={roles?.find((role) => role.type === ProposalRoleType.CLIENT)}
        proposalStatus={proposal?.status}
      />
      {/* AUTHOR */}
      <h4 className="text-xs font-bold text-concrete uppercase mb-2 mt-6">Author</h4>
      <RoleSignature
        role={roles?.find((role) => role.type === ProposalRoleType.AUTHOR)}
        proposalStatus={proposal?.status}
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
