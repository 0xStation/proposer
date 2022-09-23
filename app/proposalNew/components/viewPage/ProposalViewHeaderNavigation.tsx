import { Link, Routes, useParam, useQuery, useRouter } from "blitz"
import { CheckCircleIcon } from "@heroicons/react/solid"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import getProposalNewById from "app/proposalNew/queries/getProposalNewById"
import { ProposalRoleApprovalStatus, ProposalRoleType } from "@prisma/client"
import { ProposalRole } from "app/proposalRole/types"
import useStore from "app/core/hooks/useStore"
import { ProposalStatusPill } from "../../../core/components/ProposalStatusPill"
import { genPathFromUrlObject } from "app/utils"
import { CopyBtn } from "app/core/components/CopyBtn"
import { CollaboratorPfps } from "app/core/components/CollaboratorPfps"
import ApproveProposalNewModal from "app/proposalNew/components/ApproveProposalNewModal"
import convertJSDateToDateAndTime from "app/core/utils/convertJSDateToDateAndTime"
import getProposalNewSignaturesById from "app/proposalNew/queries/getProposalNewSignaturesById"
import useGetUsersRemainingRolesToSignFor from "app/core/hooks/useGetUsersRemainingRolesToSignFor"

const findProposalRoleByRoleType = (roles, proposalType) =>
  roles?.find((role) => role.role === proposalType)

const Tab = ({ router, route, children }) => {
  return (
    <li
      className={`${
        router.pathname === route.pathname && "font-bold border-b border-b-marble-white mb-[-1px]"
      } mr-4 cursor-pointer`}
    >
      <Link href={route}>{children}</Link>
    </li>
  )
}

export const ProposalViewHeaderNavigation = () => {
  const proposalId = useParam("proposalId") as string
  const proposalApprovalModalOpen = useStore((state) => state.proposalApprovalModalOpen)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)
  const router = useRouter()
  const [proposal] = useQuery(
    getProposalNewById,
    { id: proposalId },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!proposalId,
    }
  )
  const [signatures] = useQuery(
    getProposalNewSignaturesById,
    { proposalId: proposalId },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!proposalId,
    }
  )

  const [remainingRoles, _error, loading] = useGetUsersRemainingRolesToSignFor(proposal, signatures)

  // author used to return to workspace page with proposal list view
  const author = findProposalRoleByRoleType(proposal?.roles, ProposalRoleType.AUTHOR)
  // numerator for the progress circle
  const totalApprovalCount =
    proposal?.roles?.filter((role) => role.approvalStatus === ProposalRoleApprovalStatus.COMPLETE)
      .length || 0

  // activeUser's view permissions
  const activeUserHasProposalRole = remainingRoles.length > 0
  const activeUserHasRolesToSign = remainingRoles.length === 0

  const currentPageUrl =
    typeof window !== "undefined"
      ? genPathFromUrlObject(
          Routes.ViewProposalNew({
            proposalId,
          })
        )
      : ""

  return (
    <>
      {proposal && (
        <ApproveProposalNewModal
          isOpen={proposalApprovalModalOpen}
          setIsOpen={toggleProposalApprovalModalOpen}
          proposal={proposal}
        />
      )}
      <div className="w-full min-h-64">
        <div className="mt-6 flex flex-row">
          <span className="text-concrete hover:text-light-concrete">
            <Link href={Routes.WorkspaceHome({ accountAddress: author?.address as string })}>
              Proposals
            </Link>{" "}
            /&nbsp;
          </span>
          {proposal?.data?.content?.title || (
            <span className="h-5 w-36 rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
          )}
        </div>
        {proposal?.data.content.title ? (
          <h2 className="mt-6 text-marble-white text-2xl font-bold">
            {proposal?.data.content.title}
          </h2>
        ) : (
          <div className="mt-6 h-8 w-42 rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
        )}
        <div className="mt-1">
          <div className="uppercase text-xs tracking-wider text-concrete flex flex-row">
            <p className="inline mr-1"> Last updated: </p>
            {proposal?.timestamp ? (
              <p>{convertJSDateToDateAndTime({ timestamp: proposal?.timestamp as Date })}</p>
            ) : (
              <div className="h-4 w-32 rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
            )}
          </div>
        </div>
        {/* PROPOSAL STATUS */}
        <div className="mt-6 flex flex-row justify-between">
          <div className="space-x-2 flex flex-row">
            <ProposalStatusPill status={proposal?.status} />
            <ProgressCircleAndNumber
              numerator={totalApprovalCount}
              denominator={proposal?.roles?.length || 0}
            />
          </div>
          <CollaboratorPfps
            // unique accounts
            accounts={(proposal?.roles as ProposalRole[])
              ?.map((role) => role?.account)
              ?.filter((account, idx, accounts) => {
                return accounts?.findIndex((acc) => acc?.address === account?.address) === idx
              })}
          />
        </div>
        {/* BUTTONS */}
        <div className="w-full mt-6 box-border">
          {/*
          - if activeUser has a role on the proposal, check if they've signed already,
          - if they haven't signed, show the sign button, if they have signed, show the "signed" button
          - if they don't have a role, just show the copy icon
          */}
          {activeUserHasProposalRole && !loading ? (
            !activeUserHasRolesToSign ? (
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
              // TODO: add icons to sds buttons, currently can't use unemphasized with icon
              <button
                className="mb-2 sm:mb-0 border rounded w-[300px] sm:w-[400px] md:w-[614px] h-[35px] mr-3 opacity-70 bg-electric-violet border-electric-violet text-tunnel-black cursor-not-allowed"
                disabled
              >
                <CheckCircleIcon className="h-5 w-5 inline mb-1 mr-2" />
                Signed
              </button>
            )
          ) : !proposal || loading ? (
            // BUTTONS LOADING STATE
            <div className="flex flex-row justify-between">
              <span className="h-[35px] w-[680px] rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
            </div>
          ) : null}
          {proposal && <CopyBtn textToWrite={currentPageUrl} />}
        </div>
        {/* TABS */}
        <div className="mt-12 self-end flex flex-row space-x-4 border-b border-concrete">
          <ul className="flex flex-row">
            <Tab router={router} route={Routes.ViewProposalNew({ proposalId })}>
              Proposal
            </Tab>
            <Tab router={router} route={Routes.ProposalPayments({ proposalId })}>
              Payments
            </Tab>
          </ul>
        </div>
      </div>
    </>
  )
}
