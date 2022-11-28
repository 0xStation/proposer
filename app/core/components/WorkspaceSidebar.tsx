import React, { useState } from "react"
import { LightBulbIcon, NewspaperIcon, CogIcon } from "@heroicons/react/outline"
import AccountMediaObject from "./AccountMediaObject"
import useUserHasPermissionOfAddress from "../hooks/useUserHasPermissionOfAddress"
import { Routes, useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery } from "@blitzjs/rpc"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { toChecksumAddress } from "../utils/checksumAddress"
import WorkspaceNavigationDrawer from "./WorkspaceNavigationDrawer"

export const WorkspaceSidebar = () => {
  const router = useRouter()
  const accountAddress = useParam("accountAddress", "string") as string
  const [isWorkspaceDrawerOpen, setIsWorkspaceDrawerOpen] = useState<boolean>(false)
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
  const { hasPermissionOfAddress: hasPrivateAccess } = useUserHasPermissionOfAddress(
    accountAddress,
    account?.addressType,
    account?.data?.chainId
  )

  return (
    <>
      <WorkspaceNavigationDrawer
        isOpen={isWorkspaceDrawerOpen}
        setIsOpen={setIsWorkspaceDrawerOpen}
        account={account}
      />
      <div className="block md:hidden mx-5 md:mx-10 py-6 border-b border-wet-concrete space-y-6">
        {/* PROFILE */}
        {account ? (
          <span onClick={(e) => setIsWorkspaceDrawerOpen(true)}>
            <AccountMediaObject account={account} showActionIcons={true} href="#" />
          </span>
        ) : (
          // LOADING STATE
          <div
            tabIndex={0}
            className={`h-10 w-full rounded-4xl flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
          />
        )}
      </div>
      {/* LEFT SIDEBAR */}
      <div className="hidden md:block h-full w-[288px] border-r border-concrete p-6">
        <div className="pb-6 border-b border-wet-concrete space-y-6">
          {/* PROFILE */}
          {account ? (
            <AccountMediaObject account={account} showActionIcons={true} />
          ) : (
            // LOADING STATE
            <div
              tabIndex={0}
              className={`h-10 w-full rounded-4xl flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
            />
          )}
        </div>
        {/* TABS */}
        <ul className="mt-6 space-y-2">
          {/* PROPOSALS */}
          <li
            className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
              router.pathname === Routes.WorkspaceHome({ accountAddress }).pathname &&
              "bg-wet-concrete"
            }`}
            onClick={() => router.push(Routes.WorkspaceHome({ accountAddress }))}
          >
            <LightBulbIcon className="h-5 w-5 text-white cursor-pointer" />
            <span>Proposals</span>
          </li>
          {/* RFPS */}
          <li
            className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
              router.pathname === Routes.WorkspaceRfps({ accountAddress }).pathname &&
              "bg-wet-concrete"
            }`}
            onClick={() => router.push(Routes.WorkspaceRfps({ accountAddress }))}
          >
            <NewspaperIcon className="h-5 w-5 text-white cursor-pointer" />
            <span>RFPs</span>
          </li>
          {/* SETTINGS */}
          {hasPrivateAccess && (
            <li
              className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
                router.pathname === Routes.WorkspaceSettings({ accountAddress }).pathname &&
                "bg-wet-concrete"
              }`}
              onClick={() => router.push(Routes.WorkspaceSettings({ accountAddress }))}
            >
              <CogIcon className="h-5 w-5 text-white cursor-pointer" />
              <span>Settings</span>
            </li>
          )}
        </ul>
      </div>
    </>
  )
}

export default WorkspaceSidebar
