import { useState } from "react"
import { BlitzPage, Link, Routes, useQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import Pagination from "app/core/components/Pagination"
import { PAGINATION_TAKE } from "app/core/utils/constants"
import getAllAccounts from "app/account/queries/getAllAccounts"
import AccountMediaObject from "app/core/components/AccountMediaObject"

enum Tab {
  WORKSPACES = "WORKSPACES",
}

const Explore: BlitzPage = () => {
  const [page, setPage] = useState<number>(0)
  const [tab, setTab] = useState<Tab>(Tab.WORKSPACES)

  const [accounts] = useQuery(
    getAllAccounts,
    { page: page, paginationTake: PAGINATION_TAKE, sortUpdatedAt: true },
    { suspense: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  )

  return (
    <Layout title="Explore stations">
      <div className="h-screen">
        <div className="pt-8 px-8 pb-3 flex flex-row justify-between">
          <div>
            <h1 className="font-bold text-2xl">Explore</h1>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between pl-8">
          {/* Tabs */}
          <div className="self-end flex flex-row space-x-4">
            <span
              className={`${
                tab === Tab.WORKSPACES && "border-b mb-[-1px] font-bold"
              } cursor-pointer`}
              onClick={() => setTab(Tab.WORKSPACES)}
            >
              Workspaces
            </span>
          </div>

          <Pagination
            results={accounts as any[]}
            resultsCount={accounts?.length as number}
            page={page}
            setPage={setPage}
            resultsLabel={Tab.WORKSPACES.toString().toLowerCase()}
            className="pl-6 sm:pr-6 text-sm pt-5 mb-5"
          />
        </div>
        {/* Table Columns */}
        <div className="border-y border-concrete pt-8 text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
          <span className="basis-96 ml-6 mb-2 tracking-wider">Info</span>
          <span className="basis-[42rem] ml-9 mb-2 tracking-wider">About</span>
        </div>
        {/* Table Rows */}
        <div className="overflow-y-scroll h-[calc(100vh-141px)]">
          {accounts?.map((account, i) => {
            return <WorkspaceComponent account={account} key={i} />
          })}
        </div>
      </div>
    </Layout>
  )
}

const WorkspaceComponent = ({ account }) => {
  return (
    <Link href={Routes.ProfileHome({ accountAddress: account.address })}>
      <div
        className="w-full flex flex-row border-b border-concrete cursor-pointer hover:bg-wet-concrete py-3"
        tabIndex={0}
      >
        <div className="flex flex-col content-center align-middle ml-6 mr-1">
          <AccountMediaObject account={account} />
        </div>
        <div className="basis-[42rem] ml-9 truncate self-center">{account?.data?.bio}</div>
      </div>
    </Link>
  )
}

Explore.suppressFirstRenderFlicker = true
export default Explore
