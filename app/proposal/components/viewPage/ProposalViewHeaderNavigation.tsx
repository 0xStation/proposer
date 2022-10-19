import { Link, Routes, useParam, useQuery, useRouter } from "blitz"
import { CheckCircleIcon } from "@heroicons/react/solid"
import Button from "app/core/components/sds/buttons/Button"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import getProposalById from "app/proposal/queries/getProposalById"
import {
  ProposalStatus,
  ProposalRoleApprovalStatus,
  ProposalRoleType,
  RfpStatus,
} from "@prisma/client"
import { ProposalRole } from "app/proposalRole/types"
import useStore from "app/core/hooks/useStore"
import { ProposalStatusPill } from "../../../core/components/ProposalStatusPill"
import { genPathFromUrlObject } from "app/utils"
import { CopyBtn } from "app/core/components/CopyBtn"
import { CollaboratorPfps } from "app/core/components/CollaboratorPfps"
import ApproveProposalModal from "app/proposal/components/ApproveProposalModal"
import convertJSDateToDateAndTime from "app/core/utils/convertJSDateToDateAndTime"
import useGetUsersRolesToSignFor from "app/core/hooks/useGetUsersRolesToSignFor"
import LinkArrow from "app/core/icons/LinkArrow"
import { LINKS } from "app/core/utils/constants"
import SendProposalModal from "../SendProposalModal"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"
import getRfpByProposalId from "app/rfp/queries/getRfpByProposalId"

const findProposalRoleByRoleType = (roles, proposalType) =>
  roles?.find((role) => role.type === proposalType)

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
  const activeUser = useStore((state) => state.activeUser)
  const proposalId = useParam("proposalId") as string
  const proposalApprovalModalOpen = useStore((state) => state.proposalApprovalModalOpen)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)
  const sendProposalModalOpen = useStore((state) => state.sendProposalModalOpen)
  const toggleSendProposalModalOpen = useStore((state) => state.toggleSendProposalModalOpen)
  const router = useRouter()
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!proposalId,
    }
  )
  const [roles] = useQuery(
    getRolesByProposalId,
    { proposalId: proposal?.id as string },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: Boolean(proposal?.id),
      cacheTime: 60 * 10000, // ten minutes in milliseconds
    }
  )
  const [rfp] = useQuery(
    getRfpByProposalId,
    { proposalId: proposalId },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!proposalId,
      cacheTime: 60 * 10000, // ten minutes in milliseconds
    }
  )

  const [remainingRoles, signedRoles, _error, loading] = useGetUsersRolesToSignFor(proposal)

  // author used to return to workspace page with proposal list view
  const author = findProposalRoleByRoleType(roles, ProposalRoleType.AUTHOR)
  // numerator for the progress circle
  const totalApprovalCount =
    proposal?.roles?.filter(
      (role) =>
        role.approvalStatus === ProposalRoleApprovalStatus.APPROVED ||
        role.approvalStatus === ProposalRoleApprovalStatus.SENT // include author's SEND signature in net count too
    ).length || 0

  // activeUser's view permissions
  const activeUserIsSigner = signedRoles.length + remainingRoles.length > 0
  const activeUserHasRolesToSign = remainingRoles.length > 0

  const currentPageUrl =
    typeof window !== "undefined"
      ? genPathFromUrlObject(
          Routes.ViewProposal({
            proposalId,
          })
        )
      : ""

  return (
    <>
      <SendProposalModal
        isOpen={sendProposalModalOpen}
        setIsOpen={toggleSendProposalModalOpen}
        proposal={proposal}
      />
      {proposal && (
        <ApproveProposalModal
          isOpen={proposalApprovalModalOpen}
          setIsOpen={toggleProposalApprovalModalOpen}
          proposal={proposal}
        />
      )}
      <div className="w-full min-h-64">
        <div className="mt-6 flex flex-row">
          {rfp ? (
            <>
              <span className="text-concrete hover:text-light-concrete">
                <Link href={Routes.RfpDetail({ rfpId: rfp?.id as string })}>RFPs</Link> /&nbsp;
              </span>

              {rfp?.data?.content?.title ? (
                <span className="text-marble-white">{rfp?.data?.content?.title}</span>
              ) : (
                <span className="h-5 w-36 rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
              )}
            </>
          ) : (
            <>
              {" "}
              <span className="text-concrete hover:text-light-concrete">
                <Link href={Routes.WorkspaceHome({ accountAddress: author?.address as string })}>
                  Proposals
                </Link>{" "}
                /&nbsp;
              </span>
              {proposal?.data?.content?.title || (
                <span className="h-5 w-36 rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
              )}
            </>
          )}
        </div>
        {proposal?.data.content.title ? (
          <h2 className="mt-6 text-marble-white text-2xl font-bold">
            {proposal?.data.content.title}
          </h2>
        ) : (
          <div className="mt-6 h-8 w-42 rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
        )}
        {/* IPFS and LAST UPDATED */}
        {!proposal ? (
          <div className="mt-6 h-4 w-96 rounded-l bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
        ) : (
          <div className="mt-6 flex flex-row items-center space-x-6 h-4">
            {proposal?.data?.ipfsMetadata?.hash && (
              <a
                href={`${LINKS.PINATA_BASE_URL}${proposal?.data?.ipfsMetadata?.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row uppercase text-xs text-electric-violet items-center"
              >
                <p className="inline mr-1"> View on ipfs </p>
                <LinkArrow className="fill-electric-violet" />
              </a>
            )}
            {proposal?.timestamp && (
              <div className="uppercase text-xs text-concrete flex flex-row">
                <p className="inline mr-1"> Last updated: </p>
                <p>{convertJSDateToDateAndTime({ timestamp: proposal?.timestamp as Date })}</p>
              </div>
            )}
          </div>
        )}
        {/* PROPOSAL STATUS */}
        <div className="mt-6 flex flex-row justify-between">
          <div className="space-x-2 flex flex-row">
            <ProposalStatusPill status={proposal?.status} />
            {(proposal?.status === ProposalStatus.AWAITING_APPROVAL ||
              proposal?.status === ProposalStatus.APPROVED) && (
              <ProgressCircleAndNumber
                numerator={totalApprovalCount}
                denominator={proposal?.roles?.length || 0}
              />
            )}
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
        <div className="w-full mt-6">
          {Boolean(rfp && rfp?.status === RfpStatus?.CLOSED) && (
            <div className="rounded bg-neon-carrot text-tunnel-black text-center p-2 mb-3 font-bold">
              <p className="inline">
                This RFP is currently closed, but is still open for viewing.{" "}
              </p>
              <p className="inline underline underline-offset-2">
                <Link href={Routes.RfpDetail({ rfpId: rfp?.id as string })}>View RFP</Link>
              </p>
            </div>
          )}
          <div className="relative">
            {loading ? (
              <div className="flex flex-row">
                <span className="h-[35px] w-[670px] bg-wet-concrete shadow border-solid motion-safe:animate-pulse rounded" />
              </div>
            ) : (
              <>
                {/*
                  - if activeUser has a role on the proposal, check if they've signed already,
                  - if they haven't signed, show the sign button, if they have signed, show the "signed" button
                  - if they don't have a role, just show the copy icon
                */}
                {proposal &&
                  proposal.status === ProposalStatus.DRAFT &&
                  activeUser?.address === author?.address && (
                    <div className="flex flex-row">
                      <Button
                        className="mr-3 w-full"
                        onClick={() => toggleSendProposalModalOpen(true)}
                      >
                        Send proposal
                      </Button>
                      {proposal && <CopyBtn className="inline" textToWrite={currentPageUrl} />}
                    </div>
                  )}
                {activeUserIsSigner
                  ? activeUserHasRolesToSign && (
                      <div className="flex flex-row">
                        {proposal?.status !== ProposalStatus?.DRAFT && (
                          <>
                            <div className="relative group w-full mr-2">
                              <Button
                                overrideWidthClassName="inline w-full"
                                className="mr-3"
                                onClick={() => toggleProposalApprovalModalOpen(true)}
                                isDisabled={Boolean(rfp && rfp?.status === RfpStatus?.CLOSED)}
                              >
                                Approve
                              </Button>
                              {
                                <div className="absolute group-hover:block hidden left-32 text-xs text-marble-white bg-wet-concrete rounded p-3 mt-2 -mb-5">
                                  This RFP needs to be open for submissions to approve this
                                  proposal.
                                </div>
                              }
                            </div>
                            {proposal && (
                              <CopyBtn className="inline" textToWrite={currentPageUrl} />
                            )}
                          </>
                        )}
                      </div>
                    )
                  : null}
              </>
            )}
          </div>
        </div>
        {/* TABS */}
        <div className="mt-12 self-end flex flex-row space-x-4 border-b border-concrete">
          <ul className="flex flex-row">
            <Tab router={router} route={Routes.ViewProposal({ proposalId })}>
              Proposal
            </Tab>
            {(proposal?.payments || []).length > 0 && (
              <Tab router={router} route={Routes.ProposalPayments({ proposalId })}>
                Payments
              </Tab>
            )}
          </ul>
        </div>
      </div>
    </>
  )
}
