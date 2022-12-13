import { useQuery } from "@blitzjs/rpc"
import { ProposalRoleType } from "@prisma/client"
import { Proposal } from "app/proposal/types"
import { RoleSignature } from "./RoleSignature"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"
import { EditIcon } from "./EditIcon"
import { PencilIcon } from "@heroicons/react/solid"
import { ToolTip } from "./ToolTip"

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
      staleTime: 60 * 1000, // 1 minute
    }
  )
  const isFundingProposal = proposal?.payments && Boolean(proposal?.payments?.length)

  // This check is needed for old non-funding proposals that have author, contributor, and client
  // instead of just author and client
  const hasContributorRole = roles?.find((role) => role.type === ProposalRoleType.CONTRIBUTOR)

  const contributors = roles?.filter((role) => role.type === ProposalRoleType.CONTRIBUTOR) || []

  return roles ? (
    <div className={`border border-b border-concrete rounded-2xl px-6 py-6 ${className}`}>
      {contributors.length > 0 && (
        <>
          {/* CONTRIBUTOR */}
          <div className="w-full flex flex-row justify-between items-center">
            <h4 className="text-xs font-bold text-concrete uppercase mt-2 mb-2">Contributors</h4>
            <div className="group">
              <ToolTip>Edit contributors</ToolTip>
              <PencilIcon className="h-5 w-5 inline text-marble-white cursor-pointer" />
            </div>
          </div>
          {contributors.map((contributor, idx) => {
            return (
              <RoleSignature role={contributor} proposal={proposal} key={`contributor-${idx}`} />
            )
          })}
          {/* <p className="text-electric-violet font-bold">+ Add contributor</p> */}
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
        proposal={proposal}
      />
      {/* AUTHOR */}
      <h4 className="text-xs font-bold text-concrete uppercase mb-2 mt-6">Author</h4>
      <RoleSignature
        role={roles?.find((role) => role.type === ProposalRoleType.AUTHOR)}
        proposal={proposal}
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
