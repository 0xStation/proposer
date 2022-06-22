import { useState } from "react"
import { BlitzPage, Routes, useParam, useQuery, Link, useRouter, invalidateQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import {
  DEFAULT_PFP_URLS,
  PROPOSAL_STATUS_DISPLAY_MAP,
  PAGINATION_TAKE,
  PROPOSAL_STATUSES_FILTER_ARRAY,
} from "app/core/utils/constants"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RFPHeaderNavigation from "app/rfp/components/RFPHeaderNavigation"
import { Menu, Transition } from "@headlessui/react"
import DropdownChevronIcon from "app/core/icons/DropdownChevronIcon"
import { Fragment } from "react"
import { Form } from "react-final-form"
import getProposalsByRfpId from "app/proposal/queries/getProposalsByRfpId"
import { formatDate } from "app/core/utils/formatDate"
import getRfpById from "app/rfp/queries/getRfpById"
import { ProposalStatus } from "app/proposal/types"
import Checkbox from "app/core/components/form/Checkbox"
import BackArrow from "app/core/icons/BackArrow"
import ForwardArrow from "app/core/icons/ForwardArrow"

const ProposalsTab: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const rfpId = useParam("rfpId") as string
  const [filters, setFilters] = useState<Set<ProposalStatus>>(new Set<ProposalStatus>())
  const [page, setPage] = useState<number>(0)
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )

  const [proposals] = useQuery(
    getProposalsByRfpId,
    { rfpId: rfpId, page: 1, paginationTake: PAGINATION_TAKE },
    { suspense: false, enabled: !!rfpId }
  )

  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
      <TerminalNavigation>
        <RFPHeaderNavigation rfpId={rfpId} />
        <div className="h-[calc(100vh-240px)] flex flex-col">
          <div className="w-full h-20 flex sm:flex-row justify-between items-center">
            <div className="flex self-start">
              <FilterPill
                title="Status"
                className="mt-6 ml-6"
                filterValues={PROPOSAL_STATUSES_FILTER_ARRAY}
                filters={filters}
                setFilters={setFilters}
                setPage={setPage}
              />
            </div>
            <div className="ml-6 sm:mr-6 text-sm pt-1">
              Showing
              <span className="text-electric-violet font-bold"> {page * PAGINATION_TAKE + 1} </span>
              to
              <span className="text-electric-violet font-bold">
                {" "}
                {(page + 1) * PAGINATION_TAKE > proposals?.length!
                  ? proposals?.length
                  : (page + 1) * PAGINATION_TAKE}{" "}
              </span>
              of
              <span className="font-bold"> {proposals?.length} </span>
              members
              <button className="w-6 ml-2" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <BackArrow className={`${page === 0 ? "fill-concrete" : "fill-marble-white"}`} />
              </button>
              <button
                disabled={proposals?.length! < PAGINATION_TAKE}
                onClick={() => setPage(page + 1)}
              >
                <ForwardArrow
                  className={`${
                    proposals?.length! < PAGINATION_TAKE ? "fill-concrete" : "fill-marble-white"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-b border-concrete h-[44px] text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-[38rem] ml-6 mb-2">Proposal</span>
            <span className="basis-32 ml-9 mb-2">Approval</span>
            <span className="basis-32 ml-6 mb-2">Amount</span>
            <span className="basis-32 ml-2 mb-2">Submitted Date</span>
            <span className="basis-32 ml-6 mr-6 mb-2">Creator</span>
          </div>
          <div className="h-[calc(100vh-284px)] overflow-y-auto">
            {proposals &&
              proposals.map((proposal, idx) => (
                <ProposalComponent proposal={proposal} rfp={rfp} key={idx} />
              ))}
          </div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

const ProposalComponent = ({ proposal, rfp }) => {
  return (
    <Link href={"#"}>
      <div className="border-b border-concrete w-full cursor-pointer hover:bg-wet-concrete pt-5">
        <div className="flex flex-row items-center space-x-2 ml-6">
          <span
            className={`h-2 w-2 rounded-full ${
              PROPOSAL_STATUS_DISPLAY_MAP[proposal.status]?.color || "bg-concrete"
            }`}
          />
          <span className="text-xs uppercase tracking-wider">
            {PROPOSAL_STATUS_DISPLAY_MAP[proposal.status]?.copy}
          </span>
        </div>
        <div className="w-full flex flex-row mb-5">
          <div className="basis-[38rem] ml-6 mb-2">
            <h2 className="text-xl mt-2 mb-3">{proposal?.data?.content?.title}</h2>
          </div>
          <div className="basis-32 ml-9 mb-2 self-center">
            <p>
              {/* TODO: Figure out how to show signers per milestone */}
              {`${proposal.data?.signatures?.length || "0"} / ${
                rfp?.checkbook?.data?.quorum || "N/A"
              }`}
            </p>
          </div>
          <div className="basis-32 ml-6 mb-2 self-center">
            {proposal.data?.funding?.amount || "N/A"}
          </div>
          <div className="basis-32 ml-2 mb-2 self-center">
            {formatDate(proposal.createdAt) || "N/A"}
          </div>
          <div className="basis-32 ml-6 mr-6 mb-2 self-center">
            {/* TODO: create a flag to indicate the main author when creating an account proposal */}
            <img
              src={proposal?.collaborators[0]?.account?.data?.pfpURL}
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

const FilterPill = ({ title, className = "", filters, filterValues, setFilters, setPage }) => {
  const [clearDefaultValue, setClearDefaultValue] = useState<boolean>(false)

  const handleClearFilters = (e) => {
    e.preventDefault()

    filters.clear()

    setPage(0)
    setFilters(filters)
    // clear filled checkboxes by removing the defaultChecked value
    // bumping the key will reset the uncontrolled component's internal state
    setClearDefaultValue(true)

    invalidateQuery(getProposalsByRfpId)
  }

  return (
    <Menu as="div" className={`relative ${className} mb-2 sm:mb-0`}>
      {({ open }) => {
        return (
          <>
            <Menu.Button className="block h-[28px] text-marble-white">
              <div className="flex items-center">
                <span
                  className={`${
                    open
                      ? "bg-marble-white text-tunnel-black  border-marble-white"
                      : "hover:bg-marble-white hover:text-tunnel-black border-concrete hover:border-marble-white"
                  } group rounded-full border h-[17px] w-max p-4 flex flex-center items-center cursor-pointer `}
                >
                  {title}
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
                    invalidateQuery(getProposalsByRfpId)
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
                                  {PROPOSAL_STATUS_DISPLAY_MAP[filterVal]?.copy}
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
                          onClick={(e) => {}}
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
export default ProposalsTab
