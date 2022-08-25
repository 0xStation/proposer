import {
  BlitzPage,
  useQuery,
  useParam,
  Routes,
  useRouter,
  Link,
  useRouterQuery,
  invalidateQuery,
  useSession,
} from "blitz"
import { useState, useEffect } from "react"
import { trackClick, trackImpression } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import getRfpsByTerminalId from "app/rfp/queries/getRfpsByTerminalId"
import getRfpCountByTerminalId from "app/rfp/queries/getRfpCountByTerminalId"
import {
  RFP_STATUS_DISPLAY_MAP,
  PAGINATION_TAKE,
  RFP_STATUSES_FILTER_OPTIONS,
} from "app/core/utils/constants"
import { RfpStatus } from "app/rfp/types"
import SuccessRfpModal from "app/rfp/components/SuccessRfpModal"
import useStore from "app/core/hooks/useStore"
import FilterPill from "app/core/components/FilterPill"
import Pagination from "app/core/components/Pagination"
import useAdminForTerminal from "app/core/hooks/useAdminForTerminal"
import { AddFundsModal } from "../../../../core/components/AddFundsModal"
import { DateTime } from "luxon"
import { useUserCanSubmitToRfp, useUserCanViewRfp } from "app/core/utils/permissions"
import Button from "app/core/components/sds/buttons/Button"
import { ButtonType } from "app/core/components/sds/buttons/Button"
import { genUrlFromRoute } from "app/utils/genUrlFromRoute"

const {
  FEATURE: { RFP },
  PAGE_NAME,
} = TRACKING_EVENTS

const RfpNotFound = () => (
  <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
    <p className="font-bold text-lg">Projects is empty</p>
    <p>No projects have been created yet.</p>
  </div>
)

const BulletinPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const setToastState = useStore((state) => state.setToastState)
  const session = useSession({ suspense: false })
  const query = useRouterQuery()
  const [showRfpSuccessModal, setShowRfpSuccessModal] = useState<boolean>(false)
  const [terminal, { isSuccess: finishedFetchingTerminal }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle, refetchOnWindowFocus: false }
  )
  const activeUser = useStore((state) => state.activeUser)

  const isLoggedInAndIsAdmin = useAdminForTerminal(terminal)
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState<boolean>(false)
  const [rfpStatusFilters, setRfpStatusFilters] = useState<Set<RfpStatus>>(new Set<RfpStatus>())

  const [page, setPage] = useState<number>(0)

  const [rfps] = useQuery(
    getRfpsByTerminalId,
    {
      terminalId: terminal?.id as number,
      statuses: Array.from(rfpStatusFilters),
      page: page,
      paginationTake: PAGINATION_TAKE,
      includeDeletedRfps: false,
    },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )

  const [rfpCount, { isSuccess: finishedFetchingRfpCount }] = useQuery(
    getRfpCountByTerminalId,
    {
      terminalId: terminal?.id as number,
      includeDeletedRfps: false,
      statuses: Array.from(rfpStatusFilters),
    },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )

  useEffect(() => {
    if (finishedFetchingTerminal && finishedFetchingRfpCount) {
      trackImpression(RFP.EVENT_NAME.RFP_LIST_PAGE_SHOWN, {
        pageName: PAGE_NAME.RFP_LIST_PAGE,
        stationHandle: terminalHandle as string,
        stationId: terminal?.id,
        numRfps: rfpCount,
        userAddress: activeUser?.address,
      })
    }
  }, [finishedFetchingTerminal, finishedFetchingRfpCount])

  const router = useRouter()
  useEffect(() => {
    if (query.rfpPublished && session?.siwe?.address) {
      setShowRfpSuccessModal(true)
    }
  }, [query?.rfpPublished, session?.siwe?.address])

  useEffect(() => {
    if (query.rfpDeleted && session?.siwe?.address) {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Your project has been deleted.",
      })
    }
  }, [query?.rfpDeleted, session?.siwe?.address])

  useEffect(() => {
    if (query.terminalCreated && session?.siwe?.address) {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Congratulations! Your Terminal is now live!",
      })
    }
  }, [query?.terminalCreated, session?.siwe?.address])

  useEffect(() => {
    if (query.terminalAndCheckbookCreated && session?.siwe?.address) {
      setIsAddFundsModalOpen(true)
    }
  }, [query?.terminalAndCheckbookCreated, session?.siwe?.address])

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}projects`}>
      <AddFundsModal
        setIsOpen={setIsAddFundsModalOpen}
        isOpen={isAddFundsModalOpen}
        checkbookAddress={query.terminalAndCheckbookCreated as string}
        terminalCreationFlow={true}
        pageName={PAGE_NAME.RFP_LIST_PAGE}
        terminalId={terminal?.id as number}
        stationHandle={terminalHandle}
      />
      <SuccessRfpModal
        terminal={terminal}
        setIsOpen={setShowRfpSuccessModal}
        isOpen={showRfpSuccessModal}
        rfpId={query?.rfpPublished}
        isEdit={false}
      />
      <TerminalNavigation>
        {/* Filter View */}
        <div className="max-h-[250px] sm:h-[130px] border-b border-concrete">
          <div className="flex flex-row items-center ml-6 pt-7 justify-between mr-4">
            <h1 className="text-2xl font-bold">Projects</h1>
            {isLoggedInAndIsAdmin && (
              <Button
                onClick={() => {
                  trackClick(RFP.EVENT_NAME.RFP_SHOW_EDITOR_CLICKED, {
                    pageName: PAGE_NAME.RFP_LIST_PAGE,
                    stationHandle: terminalHandle as string,
                    stationId: terminal?.id,
                    numRfps: rfpCount,
                    userAddress: activeUser?.address,
                    isEdit: false,
                  })
                  router.push(Routes.CreateRFPPage({ terminalHandle }))
                }}
              >
                Create project
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex ml-6 py-4 space-x-2 flex-wrap self-start">
              <FilterPill
                label="status"
                filterOptions={RFP_STATUSES_FILTER_OPTIONS.map((rfpStatus) => ({
                  name: RFP_STATUS_DISPLAY_MAP[rfpStatus]?.copy?.toUpperCase(),
                  value: rfpStatus,
                }))}
                appliedFilters={rfpStatusFilters}
                setAppliedFilters={setRfpStatusFilters}
                refetchCallback={() => {
                  setPage(0)
                  invalidateQuery(getRfpsByTerminalId)
                }}
              />
            </div>
            <Pagination
              results={rfps as any[]}
              resultsCount={rfpCount as number}
              page={page}
              setPage={setPage}
              resultsLabel="projects"
              className="ml-6 sm:mr-6 text-sm pt-2"
            />
          </div>
        </div>
        <div className="h-[calc(100vh-130px)] w-full">
          <div className="border-b border-concrete h-[44px] text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-[36rem] ml-6 mb-2 tracking-wider">Title</span>
            <span className="basis-40 ml-9 mb-2 tracking-wider">Submissions</span>
            <span className="basis-40 ml-6 mb-2 tracking-wider">Open Date</span>
            <span className="basis-40 ml-2 mb-2 tracking-wider">Close Date</span>
            <span className="basis-40 ml-2 mr-6 mb-2 tracking-wider">Author</span>
            <span className="basis-40 mr-6"></span>
          </div>
          <div className="overflow-y-auto col-span-7 h-[calc(100vh-174px)] w-full">
            {rfps && rfps.length ? (
              rfps?.map((rfp) => (
                <RFPComponent
                  rfp={rfp}
                  terminalHandle={terminalHandle}
                  key={rfp.id}
                  activeAddress={session?.siwe?.address}
                />
              ))
            ) : rfps && rfpStatusFilters?.size ? (
              <RfpNotFound />
            ) : rfps && isLoggedInAndIsAdmin ? (
              <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
                <h1 className="text-2xl font-bold text-marble-white text-center w-[295px]">
                  Create a project
                </h1>
                <p className="mt-2 w-[340px] text-center">
                  Define your DAO&apos;s needs to begin soliciting proposals from contributors. Need
                  inspiration?
                </p>
                <p>
                  Check out some{" "}
                  <a
                    href="https://station-labs.gitbook.io/station-product-manual/for-daos-communities/request-for-proposal-rfp"
                    className="text-electric-violet"
                  >
                    examples
                  </a>
                  .
                </p>
                <Button
                  onClick={() => {
                    trackClick(RFP.EVENT_NAME.RFP_SHOW_EDITOR_CLICKED, {
                      pageName: PAGE_NAME.RFP_LIST_PAGE,
                      stationHandle: terminalHandle as string,
                      stationId: terminal?.id,
                      numRfps: rfpCount,
                      userAddress: activeUser?.address,
                      isEdit: false,
                    })
                    router.push(Routes.CreateRFPPage({ terminalHandle }))
                  }}
                >
                  Create project
                </Button>
              </div>
            ) : rfps?.length === 0 ? (
              <RfpNotFound />
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

const RFPComponent = ({ rfp, terminalHandle, activeAddress }) => {
  const [rfpOpen, setRfpOpen] = useState<boolean>(false)
  useEffect(() => {
    if (rfp) {
      const today = new Date()
      if (today > rfp.startDate && (!rfp.endDate || today < rfp.endDate)) {
        setRfpOpen(true)
      }
    }
  }, [rfp])

  const canView = useUserCanViewRfp(activeAddress, rfp)
  const canSubmit = useUserCanSubmitToRfp(activeAddress, rfp)

  if (!canView) {
    return <></>
  }

  return (
    <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: rfp.id })}>
      <div className="w-full border-b border-concrete cursor-pointer hover:bg-wet-concrete pt-5">
        <div className="flex flex-row items-center space-x-2 ml-6">
          <span className={`h-2 w-2 rounded-full ${RFP_STATUS_DISPLAY_MAP[rfp.status]?.color}`} />
          <span className="text-xs uppercase tracking-wider font-bold">
            {RFP_STATUS_DISPLAY_MAP[rfp.status]?.copy}
          </span>
        </div>
        <div className="w-full flex flex-row mb-5">
          <div className="basis-[36rem] ml-6 mb-2">
            <h2 className="text-xl mt-2">{rfp.data?.content?.title}</h2>
          </div>
          <div className="basis-40 ml-9 mb-2 self-center">
            <p>{rfp?.submissionCount}</p>
          </div>
          <div className="basis-40 ml-6 mb-2 self-center uppercase">
            <p>
              {rfp.startDate
                ? DateTime.fromJSDate(rfp.startDate as Date).toFormat("dd-MMM-yyyy")
                : "N/A"}
            </p>
            <p className="text-concrete text-sm">
              {DateTime.fromJSDate(rfp.startDate as Date).toLocaleString(DateTime.TIME_SIMPLE)}
            </p>
          </div>
          <div className="basis-40 ml-2 mb-2 self-center uppercase">
            <p>
              {rfp.endDate
                ? DateTime.fromJSDate(rfp.endDate as Date).toFormat("dd-MMM-yyyy")
                : "N/A"}
            </p>
            <p className="text-concrete text-sm h-5">
              {rfp.endDate
                ? DateTime.fromJSDate(rfp.endDate as Date).toLocaleString(DateTime.TIME_SIMPLE)
                : ""}
            </p>
          </div>
          <div className="basis-40 ml-2 mr-6 mb-2 self-center">
            <img
              src={rfp.author.data.pfpURL || DEFAULT_PFP_URLS.USER}
              className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
              alt="pfp"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.USER
              }}
            />
          </div>
          <div
            className="basis-40 mr-6 self-center relative group"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            {rfpOpen ? (
              canSubmit ? (
                <Button
                  type={ButtonType.Secondary}
                  onClick={() => {
                    window.open(
                      genUrlFromRoute(Routes.CreateProposalPage({ terminalHandle, rfpId: rfp.id })),
                      "_blank"
                    )
                  }}
                >
                  Propose
                </Button>
              ) : (
                <>
                  <Button type={ButtonType.Secondary} isDisabled={true}>
                    Propose
                  </Button>
                  <span className="hidden group-hover:block absolute top-[110%] right-0 bg-wet-concrete text-xs p-2 rounded border border-tunnel-black z-50">
                    You must hold ${rfp?.data?.permissions?.submit?.symbol} to propose.
                  </span>
                </>
              )
            ) : (
              <>
                <Button type={ButtonType.Secondary} isDisabled={true}>
                  Propose
                </Button>
                <span className="hidden group-hover:block absolute top-[110%] right-0 bg-wet-concrete text-xs p-2 rounded border border-tunnel-black">
                  You will be able to create a proposal for this RFP when it opens for submissions.
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default BulletinPage
