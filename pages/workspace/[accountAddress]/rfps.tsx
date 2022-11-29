import React, { useState } from "react"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { invalidateQuery, invoke, useQuery } from "@blitzjs/rpc"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { gSSP } from "app/blitz-server"
import FilterPill from "app/core/components/FilterPill"
import Pagination from "app/core/components/Pagination"
import Button from "app/core/components/sds/buttons/Button"
import useUserHasPermissionOfAddress from "app/core/hooks/useUserHasPermissionOfAddress"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { RFP_STATUS_DISPLAY_MAP, RFP_STATUS_FILTER_OPTIONS } from "app/core/utils/constants"
import { RfpCard } from "app/rfp/components/RfpCard"
import RfpPreCreateModal from "app/rfp/components/RfpPreCreateModal"
import getRfpCountForAccount from "app/rfp/queries/getRfpCountForAccount"
import getRfpsForAccount from "app/rfp/queries/getRfpsForAccount"
import { RfpProductStatus } from "app/rfp/types"
import { isAddress } from "ethers/lib/utils.js"
import Layout from "app/core/layouts/Layout"
import WorkspaceSidebar from "app/core/components/WorkspaceSidebar"

export const getServerSideProps = gSSP(async ({ params = {} }) => {
  const { accountAddress } = params

  if (!accountAddress || !isAddress(accountAddress as string)) {
    return {
      notFound: true,
    }
  }

  const account = await invoke(getAccountByAddress, {
    address: toChecksumAddress(accountAddress as string),
  })

  if (!account) {
    return {
      notFound: true,
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
})

const WorkspaceRfps: BlitzPage = () => {
  const accountAddress = useParam("accountAddress", "string") as string
  const RFP_PAGINATION_TAKE = 25
  const [rfpPage, setRfpPage] = useState<number>(0)
  const [rfpStatusFilters, setRfpProductStatuss] = useState<Set<RfpProductStatus>>(
    new Set<RfpProductStatus>()
  )
  const [isRfpPreCreateModalOpen, setIsRfpPreCreateModalOpen] = useState<boolean>(false)

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    {
      enabled: !!accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  // checks if session address is page's account address or is a signer of the account's Safe
  const { hasPermissionOfAddress: hasPrivateAccess } = useUserHasPermissionOfAddress(
    accountAddress,
    account?.addressType,
    account?.data?.chainId
  )

  const [rfps] = useQuery(
    getRfpsForAccount,
    {
      address: toChecksumAddress(accountAddress),
      page: rfpPage,
      paginationTake: RFP_PAGINATION_TAKE,
      statuses: Array.from(rfpStatusFilters),
    },
    {
      enabled: !!accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  const [rfpCount] = useQuery(
    getRfpCountForAccount,
    {
      address: toChecksumAddress(accountAddress),
      statuses: Array.from(rfpStatusFilters),
    },
    {
      enabled: !!accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  return (
    <>
      <RfpPreCreateModal
        isOpen={isRfpPreCreateModalOpen}
        setIsOpen={setIsRfpPreCreateModalOpen}
        accountAddress={accountAddress}
      />
      <>
        <div className="flex flex-row justify-between">
          {/* HEADER */}
          <h1 className="text-2xl font-bold">RFPs</h1>
          {/* CTA */}
          {hasPrivateAccess && (
            <Button
              className="w-full px-10 hidden md:block"
              overrideWidthClassName="max-w-fit"
              onClick={() => {
                setIsRfpPreCreateModalOpen(true)
              }}
            >
              Create RFP
            </Button>
          )}
        </div>
        {/* FILTERS & PAGINATION */}
        <div className="mt-8 mb-4 border-b border-wet-concrete pb-4 flex flex-row justify-between">
          {/* FILTERS */}
          <div className="space-x-2 flex flex-row">
            <FilterPill
              label="status"
              filterOptions={RFP_STATUS_FILTER_OPTIONS.map((status) => ({
                name: RFP_STATUS_DISPLAY_MAP[status]?.copy?.toUpperCase(),
                value: status,
              }))}
              appliedFilters={rfpStatusFilters}
              setAppliedFilters={setRfpProductStatuss}
              refetchCallback={() => {
                setRfpPage(0)
                invalidateQuery(getRfpsForAccount)
                invalidateQuery(getRfpCountForAccount)
              }}
            />
          </div>
          {/* PAGINATION */}
          <Pagination
            results={rfps as any[]}
            resultsCount={rfpCount || 0}
            page={rfpPage}
            setPage={setRfpPage}
            resultsLabel="rfps"
            paginationTake={RFP_PAGINATION_TAKE}
            className="ml-6 sm:ml-0 text-sm self-end"
          />
        </div>
        {/* RFP CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 sm:gap-2 md:gap-4 lg:gap-6 gap-1">
          {rfps &&
            rfps?.length > 0 &&
            rfps?.map((rfp, idx) => {
              return (
                <RfpCard
                  key={idx}
                  account={account!}
                  rfp={rfp}
                  href={Routes.RfpDetail({ rfpId: rfp.id })}
                />
              )
            })}
          {/* RFP LOADING */}
          {!rfps &&
            Array.from(Array(9)).map((idx) => (
              <div
                key={idx}
                tabIndex={0}
                className="h-36 rounded-md overflow-hidden bg-wet-concrete shadow border-solid motion-safe:animate-pulse"
              />
            ))}
        </div>
        {/* RFP EMPTY */}
        {rfps &&
          rfps.length === 0 &&
          (rfpStatusFilters.size ? (
            <div className="w-full h-3/4 flex items-center flex-col sm:justify-center sm:mt-0">
              <p className="text-2xl font-bold w-[295px] text-center">No matches</p>
            </div>
          ) : (
            <div className="w-full h-3/4 flex items-center flex-col sm:justify-center sm:mt-0">
              <p className="text-2xl font-bold w-[295px] text-center">No RFPs</p>
            </div>
          ))}
      </>
    </>
  )
}

WorkspaceRfps.suppressFirstRenderFlicker = true
WorkspaceRfps.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="Workspace">
      <div className="flex flex-col md:flex-row h-full">
        <WorkspaceSidebar />
        <div className="p-5 md:p-10 w-full max-h-screen overflow-y-auto">{page}</div>
      </div>
    </Layout>
  )
}
export default WorkspaceRfps
