import truncateString from "app/core/utils/truncateString"
import { BlitzPage, Routes, useParam, useQuery, Link, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RFPHeaderNavigation from "app/rfp/components/RFPHeaderNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
import { Menu, Transition } from "@headlessui/react"
import DropdownChevronIcon from "app/core/icons/DropdownChevronIcon"
import { Fragment } from "react"
import { Form } from "react-final-form"

const ProposalsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const rfpId = useParam("rfpId") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })
  console.log("this is rfpId: ", rfp)
  const router = useRouter()
  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
      <TerminalNavigation>
        <RFPHeaderNavigation rfpId={rfpId} />
        <div className="h-[calc(100vh-240px)] flex flex-col">
          <div className="w-full h-20 flex flex-row">
            <FilterPill title="Status" className="mt-6 ml-6" />
            <FilterPill title="Unread" className="mt-6 ml-2" />
            <FilterPill title="My proposals" className="mt-6 ml-2" />
          </div>
          <div className="border-b border-concrete h-[44px] text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-[38rem] ml-6 mb-2">Proposal</span>
            <span className="basis-32 ml-9 mb-2">Approval</span>
            <span className="basis-32 ml-6 mb-2">Amount</span>
            <span className="basis-32 ml-2 mb-2">Submitted Date</span>
            <span className="basis-32 ml-6 mr-6 mb-2">Creator</span>
          </div>
          <div className="h-[calc(100vh-284px)] overflow-y-auto">
            {Array.from(Array(5)).map((idx) => (
              <div
                className="border-b border-concrete w-full flex flex-row cursor-pointer hover:bg-wet-concrete"
                key={idx}
              >
                <div className="basis-[38rem] ml-6 mb-2">
                  <div>
                    <div className="bg-neon-carrot rounded-full min-h-1.5 max-h-1.5 min-w-1.5 max-w-1.5 inline-block align-middle mr-1">
                      &nbsp;
                    </div>
                    <p className="uppercase text-xs inline-block mt-3">In review</p>
                  </div>
                  <h2 className="text-xl mt-2">Olympus Early Tester Program</h2>
                  <p className="text-sm mt-1 mb-3">
                    <span className="text-concrete">OIP-6</span> · Projects that educate about
                    Olympus
                  </p>
                </div>
                <div className="basis-32 ml-9 mb-2 self-center">
                  <p>0</p>
                </div>
                <div className="basis-32 ml-6 mb-2 self-center">8-JUN-2022</div>
                <div className="basis-32 ml-2 mb-2 self-center">9-JUL-2022</div>
                <div className="basis-32 ml-6 mr-6 mb-2 self-center">
                  <img
                    src={DEFAULT_PFP_URLS.USER}
                    className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
                    alt="pfp"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

const FilterPill = ({ title, className = "" }) => {
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
                  onSubmit={(field) => {
                    if (!field || !Object.keys(field).length || !Object.entries(field)[0]) {
                      return
                    }
                  }}
                  render={({ form, handleSubmit }) => {
                    return (
                      <form onSubmit={handleSubmit}>
                        <div className="mt-[1.4rem] mx-[1.15rem] mb-5 space-y-3"></div>
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
export default ProposalsPage
