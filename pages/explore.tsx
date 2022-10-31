import Link from "next/link"
import { useQuery } from "@blitzjs/rpc"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useState } from "react"
import Layout from "app/core/layouts/Layout"
import Pagination from "app/core/components/Pagination"
import { PAGINATION_TAKE } from "app/core/utils/constants"
import getAllAccounts from "app/account/queries/getAllAccounts"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import { AddressType } from "@prisma/client"

enum Tab {
  ORGANIZATIONS = "ORGANIZATIONS",
  INDIVIDUALS = "INDIVIDUALS",
}

const Explore: BlitzPage = () => {
  const [page, setPage] = useState<number>(0)
  const [tab, setTab] = useState<Tab>(Tab.ORGANIZATIONS)

  const [accountTransaction] = useQuery(
    getAllAccounts,
    {
      page: page,
      paginationTake: PAGINATION_TAKE,
      sortUpdatedAt: true,
      filterAddressType:
        tab === Tab.ORGANIZATIONS
          ? AddressType.SAFE
          : tab === Tab.INDIVIDUALS
          ? AddressType.WALLET
          : undefined,
    },
    {
      suspense: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  return (
    <Layout title="Explore">
      <div className="h-[calc(100vh-240px)] p-10 flex-1">
        <h1 className="font-bold text-2xl">Explore</h1>
        <div className="flex flex-row mb-4 border-b border-concrete sm:flex-row justify-between">
          {/* Tabs */}
          <div className="self-end flex flex-row space-x-4">
            <span
              className={`${
                tab === Tab.ORGANIZATIONS && "border-b mb-[-1px] font-bold"
              } cursor-pointer`}
              onClick={() => {
                setTab(Tab.ORGANIZATIONS)
                setPage(0)
              }}
            >
              Organizations
            </span>
            <span
              className={`${
                tab === Tab.INDIVIDUALS && "border-b mb-[-1px] font-bold"
              } cursor-pointer`}
              onClick={() => {
                setTab(Tab.INDIVIDUALS)
                setPage(0)
              }}
            >
              Individuals
            </span>
          </div>

          <Pagination
            results={accountTransaction?.accounts as any[]}
            resultsCount={accountTransaction?.count as number}
            page={page}
            setPage={setPage}
            resultsLabel={tab.toString().toLowerCase()}
            className="pl-6 sm:pr-6 text-sm pt-5 mb-5"
          />
        </div>
        {/* Table */}
        <table className="w-full table-auto">
          {/* Columns */}
          <thead>
            <tr className="border-b border-concrete">
              <th className="text-xs uppercase text-light-concrete pb-2 pl-4 text-left">Info</th>
              <th className="text-xs uppercase text-light-concrete pb-2 text-left">About</th>
            </tr>
          </thead>
          {/* Rows */}
          <tbody>
            {accountTransaction?.accounts &&
              accountTransaction.accounts.map((account, idx) => {
                return (
                  <Link
                    href={Routes.WorkspaceHome({ accountAddress: account.address as string })}
                    key={`table-row-${idx}`}
                  >
                    <tr className="border-b border-wet-concrete cursor-pointer hover:bg-wet-concrete">
                      <td className="pl-4 py-4 w-64">
                        <AccountMediaObject account={account} />
                      </td>
                      <td className="text-normal py-4">{account?.data?.bio}</td>
                    </tr>
                  </Link>
                )
              })}
          </tbody>
        </table>
        {!accountTransaction?.accounts &&
          Array.from(Array(10)).map((idx) => (
            <div
              key={idx}
              tabIndex={0}
              className="h-[72px] w-full flex flex-row my-1 rounded-lg bg-wet-concrete shadow border-solid motion-safe:animate-pulse"
            />
          ))}
      </div>
    </Layout>
  )
}

Explore.suppressFirstRenderFlicker = true
export default Explore
