import { useState, useEffect } from "react"
import {
  BlitzPage,
  Routes,
  useParam,
  useQuery,
  useRouter,
  Link,
  useRouterQuery,
  invalidateQuery,
  GetServerSideProps,
  InferGetServerSidePropsType,
  invoke,
} from "blitz"
import { trackClick } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import useStore from "app/core/hooks/useStore"
import Layout from "app/core/layouts/Layout"
import SuccessProposalModal from "app/proposal/components/SuccessProposalModal"
import GetNotifiedModal from "app/proposal/components/GetNotifiedModal"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RfpHeaderNavigation from "app/rfp/components/RfpHeaderNavigation"
import getProposalsByRfpId from "app/proposal/queries/getProposalsByRfpId"
import getRfpById from "app/rfp/queries/getRfpById"
import { genPathFromUrlObject } from "app/utils"
import {
  DEFAULT_PFP_URLS,
  PROPOSAL_STATUS_DISPLAY_MAP,
  PAGINATION_TAKE,
  PROPOSAL_STATUSES_FILTER_OPTIONS,
} from "app/core/utils/constants"
import { formatDate } from "app/core/utils/formatDate"
import { RfpStatus } from "app/rfp/types"
import { Rfp } from "app/rfp/types"
import ProgressIndicator from "app/core/components/ProgressIndicator"
import { Proposal, ProposalStatus } from "app/proposal/types"
import FilterPill from "app/core/components/FilterPill"
import Pagination from "app/core/components/Pagination"
import getProposalCountByRfpId from "app/proposal/queries/getProposalCountByRfpId"
import useCheckbookFunds from "app/core/hooks/useCheckbookFunds"
import { formatUnits } from "@ethersproject/units"
import useAdminForTerminal from "app/core/hooks/useAdminForTerminal"

const {
  PAGE_NAME,
  FEATURE: { RFP },
} = TRACKING_EVENTS

const ProposalsTab: BlitzPage = ({
  rfp,
  terminal,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const isAdmin = useAdminForTerminal(terminal)
  const { proposalId, proposalDeleted } = useRouterQuery()
  const terminalHandle = useParam("terminalHandle") as string
  const rfpId = useParam("rfpId") as string
  const [proposalStatusFilters, setProposalStatusFilters] = useState<Set<ProposalStatus>>(
    new Set<ProposalStatus>()
  )
  const [page, setPage] = useState<number>(0)
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false)

  const [proposals] = useQuery(
    getProposalsByRfpId,
    {
      rfpId,
      statuses: Array.from(proposalStatusFilters),
      page: page,
      paginationTake: PAGINATION_TAKE,
    },
    { suspense: false, enabled: !!rfpId, refetchOnWindowFocus: false }
  )

  const [proposalCount, { isSuccess: isFinishedFetchingProposalCount }] = useQuery(
    getProposalCountByRfpId,
    {
      rfpId,
      statuses: Array.from(proposalStatusFilters),
    },
    {
      suspense: false,
      enabled: !!rfpId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )

  const [proposalCreatedConfirmationModal, setProposalCreatedConfirmationModal] =
    useState<boolean>(false)

  const [isGetNotifiedModalOpen, setIsGetNotifiedModalOpen] = useState<boolean>(false)

  useEffect(() => {
    if (isFinishedFetchingProposalCount) {
      trackClick(RFP.EVENT_NAME.RFP_PROPOSALS_PAGE_SHOWN, {
        pageName: PAGE_NAME.RFP_PROPOSALS_PAGE,
        userAddress: activeUser?.address,
        stationHandle: terminal?.handle,
        stationId: terminal?.id,
        rfpId,
        numProposals: proposalCount,
      })
    }
  }, [isFinishedFetchingProposalCount])

  useEffect(() => {
    if (proposalDeleted) {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Proposal successfully deleted.",
      })
    }
  }, [proposalDeleted])

  useEffect(() => {
    if (proposalId) {
      // request user saves email to receive notifications if they do not have saved email
      // TODO: if user has saved email, but unverified, should we retrigger another verification email and present a modal that asks them to verify by checking their email?
      // TODO: add dismissal of GetNotifiedModal in localStorage so we only show it once
      if (!activeUser?.data.hasSavedEmail) {
        setIsGetNotifiedModalOpen(true)
      } else {
        setProposalCreatedConfirmationModal(true)
      }
    }
  }, [proposalId, activeUser])

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Proposals`}>
      {terminal && activeUser && (
        <GetNotifiedModal isOpen={isGetNotifiedModalOpen} setIsOpen={setIsGetNotifiedModalOpen} />
      )}
      {terminal && (
        <SuccessProposalModal
          terminal={terminal}
          rfpId={rfpId}
          proposalId={proposalId}
          isOpen={proposalCreatedConfirmationModal}
          setIsOpen={setProposalCreatedConfirmationModal}
        />
      )}
      <TerminalNavigation>
        <RfpHeaderNavigation rfp={rfp} />
        <div className="h-[calc(100vh-240px)] flex flex-col">
          <div className="w-full h-20 flex sm:flex-row justify-between items-center">
            <div className="flex ml-5">
              <FilterPill
                label="status"
                filterOptions={PROPOSAL_STATUSES_FILTER_OPTIONS.map((proposalStatus) => ({
                  name: PROPOSAL_STATUS_DISPLAY_MAP[proposalStatus]?.copy?.toUpperCase(),
                  value: proposalStatus,
                }))}
                appliedFilters={proposalStatusFilters}
                setAppliedFilters={setProposalStatusFilters}
                refetchCallback={() => {
                  setPage(0)
                  invalidateQuery(getProposalsByRfpId)
                }}
              />
            </div>
            <Pagination
              results={proposals as any[]}
              resultsCount={proposalCount as number}
              page={page}
              setPage={setPage}
              resultsLabel={"proposals"}
              className="ml-6 sm:mr-6 text-sm pt-1"
            />
          </div>

          <div className="border-b border-concrete h-[44px] text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-[38rem] ml-6 mb-2">Title</span>
            <span className="basis-32 ml-6 mb-2">Amount</span>
            <span className="basis-32 ml-2 mb-2">Submission Date</span>
            <span className="basis-32 ml-6 mr-6 mb-2">Author</span>
          </div>
          <div className="h-[calc(100vh-284px)] overflow-y-auto">
            {proposals && rfp && proposals.length ? (
              proposals.map((proposal, idx) => (
                <ProposalComponent
                  terminalHandle={terminalHandle}
                  proposal={proposal}
                  rfp={rfp}
                  isAdmin={isAdmin}
                  key={idx}
                />
              ))
            ) : proposals && rfp && !proposals.length ? (
              <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
                <p className="text-2xl font-bold w-[295px] text-center">No proposals found</p>
                <p className="text-base w-[320px] text-center">
                  Share the link with your community to solicit proposals to shape the future of{" "}
                  {terminal.data.name}.
                </p>
                <button
                  className="bg-electric-violet text-tunnel-black rounded px-6 h-[35px] leading-[35px] hover:bg-opacity-70 whitespace-nowrap mt-2"
                  onClick={() => {
                    setIsUrlCopied(true)
                    navigator.clipboard.writeText(
                      genPathFromUrlObject(
                        Routes.ProposalsTab({
                          terminalHandle: terminal.handle,
                          rfpId,
                        })
                      )
                    )
                  }}
                >
                  {isUrlCopied ? "Copied!" : "Copy link"}
                </button>
              </div>
            ) : (
              Array.from(Array(15)).map((idx) => (
                <div
                  key={idx}
                  tabIndex={0}
                  className={`flex flex-row space-x-52 my-3 mx-3 rounded-lg bg-wet-concrete shadow border-solid h-[113px] motion-safe:animate-pulse`}
                />
              ))
            )}
          </div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

const ProposalComponent = ({
  proposal,
  rfp,
  terminalHandle,
  isAdmin,
}: {
  proposal: Proposal
  rfp: Rfp
  terminalHandle: string
  isAdmin: boolean
}) => {
  const router = useRouter()

  const funds = useCheckbookFunds(
    rfp.checkbook?.chainId as number,
    rfp.checkbook?.address as string,
    rfp.checkbook?.quorum as number,
    proposal.data?.funding.token
  )
  const fundsAvailable = formatUnits(funds?.available, funds?.decimals)

  const fundsHaveNotBeenApproved = (proposal) => {
    return proposal.checks.length === 0
  }

  return (
    <Link href={Routes.ProposalPage({ terminalHandle, rfpId: rfp.id, proposalId: proposal.id })}>
      <div className="border-b border-concrete w-full cursor-pointer hover:bg-wet-concrete pt-5">
        <div className="flex flex-row items-center space-x-2 ml-6">
          <span
            className={`h-2 w-2 rounded-full ${
              PROPOSAL_STATUS_DISPLAY_MAP[proposal.status]?.color || "bg-concrete"
            }`}
          />
          <span className="text-xs uppercase tracking-wider font-bold">
            {PROPOSAL_STATUS_DISPLAY_MAP[proposal?.status]?.copy || proposal?.status}
          </span>
        </div>
        <div className="w-full flex flex-row mb-5">
          <div className="basis-[38rem] ml-6 mb-2">
            <h2 className="text-xl mt-2 mb-3">{proposal?.data?.content?.title}</h2>
          </div>
          <div
            className={`basis-32 ml-6 mb-2 self-center relative group ${
              parseFloat(fundsAvailable) < parseFloat(proposal.data.funding?.amount) &&
              fundsHaveNotBeenApproved(proposal) &&
              "text-torch-red"
            }`}
          >
            {proposal.data?.funding?.amount || "N/A"} {proposal.data?.funding?.symbol}
            {/* if there are no checks, it means the value of this prop is not pending, and can be overallocated */}
            {parseFloat(fundsAvailable) < parseFloat(proposal.data.funding?.amount) &&
              fundsHaveNotBeenApproved(proposal) && (
                <span className="bg-wet-concrete border border-[#262626] text-marble-white text-xs p-2 rounded absolute top-[100%] left-0 group hidden group-hover:block shadow-lg z-50">
                  Insufficient funds.{" "}
                  {isAdmin && (
                    <span
                      className="text-electric-violet cursor-pointer"
                      onClick={(e) => {
                        // overriding the parent click handler
                        e.preventDefault()
                        router.push(Routes.CheckbookSettingsPage({ terminalHandle }))
                      }}
                    >
                      Go to checkbook to refill.
                    </span>
                  )}
                </span>
              )}
          </div>
          <div className="basis-32 ml-2 mb-2 self-center">
            {formatDate(proposal.createdAt) || "N/A"}
          </div>
          <div className="basis-32 ml-6 mr-6 mb-2 self-center">
            {/* TODO: create a flag to indicate the main author when creating an account proposal */}
            <img
              src={proposal?.collaborators[0]?.account?.data?.pfpURL || DEFAULT_PFP_URLS.USER}
              alt="PFP"
              className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.USER
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { terminalHandle, rfpId, proposalId } = context.query as {
    terminalHandle: string
    rfpId: string
    proposalId: string
  }
  const terminal = await invoke(getTerminalByHandle, { handle: terminalHandle })
  const rfp = await invoke(getRfpById, { id: rfpId })

  if (!rfp || !terminal) {
    return {
      redirect: {
        destination: Routes.BulletinPage({ terminalHandle }),
        permanent: false,
      },
    }
  }

  if (rfp.status === RfpStatus.DELETED) {
    return {
      redirect: {
        destination: Routes.RfpDeletedPage({ terminalHandle, rfpId: rfp?.id, proposalId }),
        permanent: true,
      },
    }
  }

  return {
    props: { rfp, terminal },
  }
}

export default ProposalsTab
