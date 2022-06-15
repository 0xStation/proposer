import { BlitzPage, useQuery, useParam, Image, Link, Routes } from "blitz"
import { Fragment, useEffect, useState } from "react"
import DropdownChevronIcon from "app/core/icons/DropdownChevronIcon"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { Dialog, Menu, Transition } from "@headlessui/react"
import Checkbox from "app/core/components/form/Checkbox"
import { Form } from "react-final-form"
import { AccountTerminalWithTagsAndAccount } from "app/accountTerminal/types"
import useStore from "app/core/hooks/useStore"
import useKeyPress from "app/core/hooks/useKeyPress"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import getRfpsByTerminalId from "app/rfp/queries/getRfpsForTerminal"
import { formatDate } from "app/core/utils/formatDate"

interface Filters {
  [tagType: string]: Set<number>
}

const BulletinPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const [rfps] = useQuery(
    getRfpsByTerminalId,
    {
      terminalId: terminal?.id as number,
    },
    { suspense: false, enabled: !!terminal?.id }
  )

  // filters is a hashmap where the key is the tag type and the value is a Set of strings
  // where the strings are applied filters
  const [filters, setFilters] = useState<Filters>({})

  const downPress = useKeyPress("ArrowDown")
  const upPress = useKeyPress("ArrowUp")
  const enterPress = useKeyPress("Enter")
  const [cursor, setCursor] = useState(0)
  const [hovered, setHovered] = useState(undefined)

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
      <TerminalNavigation>
        {/* Filter View */}
        <div className="max-h-[250px] sm:h-[130px] border-b border-concrete">
          <div className="flex flex-row items-center ml-6 pt-7 justify-between mr-4">
            <h1 className="text-2xl font-bold">Bulletin</h1>
            <button className="h-[35px] bg-magic-mint px-9 rounded text-tunnel-black hover:bg-opacity-70">
              Create RFP
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex ml-6 py-4 space-x-2 flex-wrap self-start">
              <FilterPill />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 h-[calc(100vh-130px)] w-full box-border">
          <div className="col-span-7 border-b border-concrete h-[44px] text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-[42rem] ml-6 mb-2">Information</span>
            <span className="basis-32 ml-9 mb-2">Submissions</span>
            <span className="basis-32 ml-6 mb-2">Start Date</span>
            <span className="basis-32 ml-2 mb-2">Expiry Date</span>
            <span className="basis-32 ml-2 mr-6 mb-2">Creator</span>
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
    <Link href={Routes.RequestForProposalInfoPage({ terminalHandle, rfpId: rfp.id })}>
      <div className="border-b border-concrete w-full flex flex-row cursor-pointer hover:bg-wet-concrete">
        <div className="basis-[42rem] ml-6 mb-2">
          <div>
            <div className="bg-neon-carrot rounded-full min-h-1.5 max-h-1.5 min-w-1.5 max-w-1.5 inline-block align-middle mr-1">
              &nbsp;
            </div>
            <p className="uppercase text-xs inline-block mt-3">{rfp.status}</p>
          </div>
          <h2 className="text-xl mt-2">{`RFP: ${rfp.data?.content?.title}`}</h2>
          <p className="text-sm mt-1 mb-3">{rfp.data?.content?.body}</p>
        </div>
        <div className="basis-32 ml-9 mb-2 self-center">
          <p>{rfp?._count?.proposals}</p>
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
    </Link>
  )
}

const FilterPill = ({}) => {
  return (
    <Menu as="div" className="relative mb-2 sm:mb-0">
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

export default BulletinPage
