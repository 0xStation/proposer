import { BlitzPage, useQuery, useParam, Routes, useRouter, Link, invalidateQuery } from "blitz"
import { Fragment, useState } from "react"
import DropdownChevronIcon from "app/core/icons/DropdownChevronIcon"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { Menu, Transition } from "@headlessui/react"
import { Form } from "react-final-form"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import getRfpsByTerminalId from "app/rfp/queries/getRfpsForTerminal"
import getRfpCountByTerminalId from "app/rfp/queries/getRfpCountByTerminalId"
import { formatDate } from "app/core/utils/formatDate"
import { RFP_STATUS_DISPLAY_MAP } from "app/core/utils/constants"
import { RfpStatus } from "app/rfp/types"
import Checkbox from "app/core/components/form/Checkbox"
import BackArrow from "app/core/icons/BackArrow"
import ForwardArrow from "app/core/icons/ForwardArrow"

const BulletinPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const [filters, setFilters] = useState<Set<RfpStatus>>(new Set<RfpStatus>())

  const [page, setPage] = useState<number>(0)

  const PAGINATION_TAKE = 50
  const RFP_STATUSES_ARRAY = [
    RfpStatus.DRAFT,
    RfpStatus.STARTING_SOON,
    RfpStatus.OPEN_FOR_SUBMISSIONS,
    RfpStatus.CLOSED,
    RfpStatus.ARCHIVED,
  ]

  const [rfps] = useQuery(
    getRfpsByTerminalId,
    {
      terminalId: terminal?.id as number,
      statuses: Array.from(filters),
      page: page,
      paginationTake: PAGINATION_TAKE,
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
    },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
    }
  )

  const router = useRouter()

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
      <TerminalNavigation>
        {/* Filter View */}
        <div className="max-h-[250px] sm:h-[130px] border-b border-concrete">
          <div className="flex flex-row items-center ml-6 pt-7 justify-between mr-4">
            <h1 className="text-2xl font-bold">Bulletin</h1>
            {/* TODO: add permissioning checks */}
            <button
              className="h-[35px] bg-magic-mint px-9 rounded text-tunnel-black hover:bg-opacity-70"
              onClick={() => router.push(Routes.CreateRFPPage({ terminalHandle }))}
            >
              Create request for proposal
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex ml-6 py-4 space-x-2 flex-wrap self-start">
              <FilterPill
                filterValues={RFP_STATUSES_ARRAY}
                filters={filters}
                setFilters={setFilters}
                setPage={setPage}
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
              members
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
            {rfps?.map((rfp) => (
              <RFPComponent rfp={rfp} terminalHandle={terminalHandle} key={rfp.id} />
            ))}
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

const FilterPill = ({ filters, setFilters, filterValues, setPage }) => {
  const [clearDefaultValue, setClearDefaultValue] = useState<boolean>(false)

  const handleClearFilters = (e) => {
    e.preventDefault()

    filters.clear()

    setPage(0)
    setFilters(filters)
    // clear filled checkboxes by removing the defaultChecked value
    // bumping the key will reset the uncontrolled component's internal state
    setClearDefaultValue(true)

    invalidateQuery(getRfpsByTerminalId)
  }
  return (
    <Menu as="div" className="relative mb-2 sm:mb-0">
      {({ open }) => {
        setClearDefaultValue(false)
        return (
          <>
            <Menu.Button className="block h-[28px] text-marble-white">
              <div className="flex items-center">
                <span
                  className={`${
                    open
                      ? "bg-marble-white text-tunnel-black  border-marble-white"
                      : "hover:bg-marble-white hover:text-tunnel-black border-concrete hover:border-marble-white"
                  } capitalize group rounded-full border h-[17px] w-max p-4 flex flex-center items-center cursor-pointer `}
                >
                  Request Status
                  <div className="ml-3">
                    <DropdownChevronIcon
                      className={`${open ? "fill-tunnel-black" : "group-hover:fill-tunnel-black"}`}
                    />
                  </div>
                </span>
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute origin-top-left mt-5 h-auto w-[11rem] sm:w-[22rem] bg-tunnel-black border border-concrete rounded-md z-10">
                <Form
                  // name: ["value"]
                  onSubmit={(fields) => {
                    if (!fields || !Object.keys(fields).length || !Object.keys(fields)[0]) {
                      return
                    }
                    Object.entries(fields).map(([key, value]) => {
                      if (filters.has(key)) {
                        if (!value.length) {
                          filters.delete(key)
                        }
                      } else {
                        filters.add(key)
                      }
                    })
                    setPage(0)
                    setFilters(filters)
                    invalidateQuery(getRfpsByTerminalId)
                  }}
                  render={({ form, handleSubmit }) => {
                    return (
                      <form onSubmit={handleSubmit}>
                        <div className="mt-[1.4rem] mx-[1.15rem] mb-5 space-y-3">
                          {filterValues?.map((filterVal) => {
                            return (
                              <div className="flex-row" key={`${clearDefaultValue}${filterVal}`}>
                                <Checkbox
                                  value={filterVal}
                                  name={`${filterVal}.active`}
                                  defaultChecked={filters.has(filterVal)}
                                  className="align-middle"
                                />
                                <p className="p-0.5 align-middle mx-4 inline leading-none uppercase">
                                  {RFP_STATUS_DISPLAY_MAP[filterVal]?.copy}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                        <button
                          type="submit"
                          className="bg-marble-white w-36 sm:w-52 h-[35px] text-tunnel-black rounded mb-4 ml-4 mr-1 hover:opacity-70"
                        >
                          Apply
                        </button>
                        <button
                          className="w-[6.5rem] hover:text-concrete mb-2 sm:mb-0"
                          onClick={(e) => {
                            handleClearFilters(e)
                            form.reset()
                          }}
                        >
                          Clear all
                        </button>
                      </form>
                    )
                  }}
                ></Form>
              </Menu.Items>
            </Transition>
          </>
        )
      }}
    </Menu>
  )
}

export default BulletinPage
