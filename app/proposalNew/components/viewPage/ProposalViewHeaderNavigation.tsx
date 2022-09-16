import { Link, Routes, useParam, useQuery, useRouter } from "blitz"
import { CheckCircleIcon, LinkIcon } from "@heroicons/react/solid"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import getProposalNewById from "app/proposalNew/queries/getProposalNewById"
import { ProposalRoleType, ProposalRole } from "@prisma/client"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import getProposalNewSignaturesById from "app/proposalNew/queries/getProposalNewSignaturesById"
import useStore from "app/core/hooks/useStore"
import { ProposalStatusPill } from "../../../core/components/ProposalStatusPill"
import { activeUserMeetsCriteria } from "app/core/utils/activeUserMeetsCriteria"

const findProposalRoleByRoleType = (roles, proposalType) =>
  roles?.find((role) => role.role === proposalType)

const genNumOfUniqueAddysFromProposalRoles = (roles: ProposalRole[]) =>
  roles
    ?.map((role) => toChecksumAddress(role?.address))
    ?.filter((v, i, addresses) => addresses?.indexOf(v) === i)?.length

export const ProposalViewHeaderNavigation = () => {
  const proposalId = useParam("proposalId") as string
  const activeUser = useStore((state) => state.activeUser)
  const router = useRouter()
  const [proposal] = useQuery(
    getProposalNewById,
    { id: proposalId },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )
  const [signatures] = useQuery(
    getProposalNewSignaturesById,
    { proposalId },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)

  // author used to return to workspace page with proposal list view
  const author = findProposalRoleByRoleType(proposal?.roles, ProposalRoleType.AUTHOR)
  // numerator for the progress circle
  const totalSignatureCount = signatures?.length || 0
  // denominator for the progress circle
  const numUniqueProposalRoleAddresses = genNumOfUniqueAddysFromProposalRoles(proposal?.roles || [])

  // activeUser's view permissions
  const activeUserHasProposalRole = activeUserMeetsCriteria(activeUser, proposal?.roles)
  const activeUserHasSigned = activeUserMeetsCriteria(activeUser, signatures)

  return (
    <>
      <div className="w-full">
        <p className="mt-6">
          <span className="text-concrete hover:text-light-concrete">
            <Link href={Routes.WorkspaceHome({ accountAddress: author?.address as string })}>
              Proposals
            </Link>{" "}
            /&nbsp;
          </span>
          {proposal?.data?.content?.title}
        </p>
        <h2 className="mt-6 text-marble-white text-2xl font-bold">
          {proposal?.data.content.title || " "}
        </h2>
        {/* proposal status */}
        <div className="mt-6 flex flex-row space-x-2">
          <ProposalStatusPill status={proposal?.status} />
          <ProgressCircleAndNumber
            numerator={totalSignatureCount}
            denominator={numUniqueProposalRoleAddresses}
          />
        </div>
        <div className="w-full mt-6 box-border">
          {/* 
          - if activeUser has a role on the proposal, check if they've signed already, 
          - if they haven't signed, show the sign button, if they have signed, show the "signed" button 
          - if they don't have a role, just show the copy icon 
          */}
          {activeUserHasProposalRole ? (
            !activeUserHasSigned ? (
              <>
                <Button
                  overrideWidthClassName="w-[300px]"
                  className="mr-3"
                  onClick={() => toggleProposalApprovalModalOpen(true)}
                >
                  Sign
                </Button>
                <Button
                  overrideWidthClassName="w-[300px]"
                  className="mr-2"
                  type={ButtonType.Secondary}
                >
                  Edit
                </Button>{" "}
              </>
            ) : (
              <button
                className="mb-2 sm:mb-0 border rounded w-[300px] sm:w-[400px] md:w-[614px] h-[35px] mr-3 opacity-70 bg-electric-violet border-electric-violet text-tunnel-black cursor-not-allowed"
                disabled
              >
                <CheckCircleIcon className="h-5 w-5 inline mb-1 mr-2" />
                Signed
              </button>
            )
          ) : null}
          <button className="w-11 h-[35px] justify-center text-marble-white border rounded border-marble-white bg-tunnel-black hover:bg-wet-concrete">
            <LinkIcon className="h-5 w-5 inline" />
          </button>
        </div>
        <div className="mt-12 self-end flex flex-row space-x-4 border-b border-concrete">
          <ul className="flex flex-row">
            <li
              className={`${
                router.pathname === Routes.ViewProposalNew({ proposalId }).pathname &&
                "font-bold border-b border-b-marble-white mb-[-1px]"
              } mr-4 cursor-pointer`}
            >
              <Link href={Routes.ViewProposalNew({ proposalId })}>Proposal</Link>
            </li>
            <li
              className={`${
                router.pathname === Routes.ProposalPayments({ proposalId }).pathname &&
                "font-bold border-b border-b-marble-white mb-[-1px]"
              } mr-4 cursor-pointer`}
            >
              <Link href={Routes.ProposalPayments({ proposalId })}>Payments</Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
