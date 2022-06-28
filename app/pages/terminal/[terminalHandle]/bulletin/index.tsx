import {
  BlitzPage,
  useQuery,
  useParam,
  Routes,
  useRouter,
  Link,
  useRouterQuery,
  invalidateQuery,
} from "blitz"
import { useState, useEffect } from "react"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import getRfpsByTerminalId from "app/rfp/queries/getRfpsByTerminalId"
import getRfpCountByTerminalId from "app/rfp/queries/getRfpCountByTerminalId"
import { formatDate } from "app/core/utils/formatDate"
import {
  RFP_STATUS_DISPLAY_MAP,
  PAGINATION_TAKE,
  RFP_STATUSES_FILTER_ARRAY,
} from "app/core/utils/constants"
import { RfpStatus } from "app/rfp/types"
import BackArrow from "app/core/icons/BackArrow"
import ForwardArrow from "app/core/icons/ForwardArrow"
import SuccessRfpModal from "app/rfp/components/SuccessRfpModal"
import useStore from "app/core/hooks/useStore"
import FilterPill from "app/core/components/FilterPill"

const BulletinPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const setToastState = useStore((state) => state.setToastState)
  const query = useRouterQuery()
  const [showRfpSuccessModal, setShowRfpSuccessModal] = useState<boolean>(false)
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle, refetchOnWindowFocus: false }
  )
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
    }
  )

  const [rfpCount] = useQuery(
    getRfpCountByTerminalId,
    {
      terminalId: terminal?.id as number,
      includeDeletedRfps: false,
    },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
    }
  )

  const router = useRouter()
  useEffect(() => {
    if (query.rfpPublished) {
      setShowRfpSuccessModal(true)
    }
  }, [query?.rfpPublished])

  useEffect(() => {
    if (query.rfpDeleted) {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Your request for proposal has been deleted.",
      })
    }
  })

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
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
            <h1 className="text-2xl font-bold">Bulletin</h1>
            {/* TODO: add permissioning checks */}
            <button
              className="h-[35px] bg-electric-violet px-9 rounded text-tunnel-black hover:bg-opacity-70"
              onClick={() => router.push(Routes.CreateRFPPage({ terminalHandle }))}
            >
              Create RFP
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex ml-6 py-4 space-x-2 flex-wrap self-start">
              <FilterPill
                label="status"
                filterValues={RFP_STATUSES_FILTER_ARRAY.map((rfpStatus) => ({
                  name: RFP_STATUS_DISPLAY_MAP[rfpStatus]?.copy?.toUpperCase(),
                  value: rfpStatus,
                }))}
                appliedFilters={rfpStatusFilters}
                setAppliedFilters={setRfpStatusFilters}
                setPage={setPage}
                refetchCallback={() => invalidateQuery(getRfpsByTerminalId)}
              />
            </div>
            <div className="ml-6 sm:mr-6 text-sm pt-2">
              Showing
              <span className="text-electric-violet font-bold"> {page * PAGINATION_TAKE + 1} </span>
              to
              <span className="text-electric-violet font-bold">
                {" "}
                {(page + 1) * PAGINATION_TAKE > rfpCount!
                  ? rfps?.length
                  : (page + 1) * PAGINATION_TAKE}{" "}
              </span>
              of
              <span className="font-bold"> {rfpCount} </span>
              rfps
              <button className="w-6 ml-2" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <BackArrow className={`${page === 0 ? "fill-concrete" : "fill-marble-white"}`} />
              </button>
              <button disabled={rfps?.length! < PAGINATION_TAKE} onClick={() => setPage(page + 1)}>
                <ForwardArrow
                  className={`${
                    rfps?.length! < PAGINATION_TAKE ? "fill-concrete" : "fill-marble-white"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="h-[calc(100vh-130px)] w-full">
          <div className="border-b border-concrete h-[44px] text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-[42rem] ml-6 mb-2 tracking-wider">Information</span>
            <span className="basis-32 ml-9 mb-2 tracking-wider">Submissions</span>
            <span className="basis-32 ml-6 mb-2 tracking-wider">Start Date</span>
            <span className="basis-32 ml-2 mb-2 tracking-wider">End Date</span>
            <span className="basis-32 ml-2 mr-6 mb-2 tracking-wider">Creator</span>
          </div>
          <div className="overflow-y-auto col-span-7 h-[calc(100vh-174px)] w-full">
            {rfps && rfps.length ? (
              rfps?.map((rfp) => (
                <RFPComponent rfp={rfp} terminalHandle={terminalHandle} key={rfp.id} />
              ))
            ) : rfps ? (
              // TODO: hide this view from non-admins and show different copy once we have checkbook signer tags
              <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
                <h1 className="text-2xl font-bold text-marble-white text-center w-[295px]">
                  Create a request for proposals (RFPs)
                </h1>
                <p className="my-2 w-[325px] text-center">
                  Help contributors write higher quality proposals by defining your DAOs’ needs and
                  priorities.
                </p>
                <button
                  className="bg-electric-violet rounded text-tunnel-black px-6 h-[35px] mt-6 hover:opacity-70"
                  onClick={() => router.push(Routes.CreateRFPPage({ terminalHandle }))}
                >
                  Create RFP
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

const RFPComponent = ({ rfp, terminalHandle }) => {
  return (
    <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: rfp.id })}>
      <div className="w-full border-b border-concrete cursor-pointer hover:bg-wet-concrete pt-5">
        <div className="flex flex-row items-center space-x-2 ml-6">
          <span className={`h-2 w-2 rounded-full ${RFP_STATUS_DISPLAY_MAP[rfp.status]?.color}`} />
          <span className="text-xs uppercase tracking-wider">
            {RFP_STATUS_DISPLAY_MAP[rfp.status]?.copy}
          </span>
        </div>
        <div className="w-full flex flex-row mb-5">
          <div className="basis-[42rem] ml-6 mb-2">
            <h2 className="text-xl mt-2">{`RFP: ${rfp.data?.content?.title}`}</h2>
          </div>
          <div className="basis-32 ml-9 mb-2 self-center">
            <p>{rfp?.submissionCount}</p>
          </div>
          <div className="basis-32 ml-6 mb-2 self-center">{formatDate(rfp.startDate)}</div>
          <div className="basis-32 ml-2 mb-2 self-center">{formatDate(rfp.endDate) || "N/A"}</div>
          <div className="basis-32 ml-2 mr-6 mb-2 self-center">
            <img
              src={rfp.author.data.pfpURL || DEFAULT_PFP_URLS.USER}
              className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
              alt="pfp"
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

export default BulletinPage
