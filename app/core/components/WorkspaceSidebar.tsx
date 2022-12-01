import React, { useState } from "react"
import { useMutation } from "@blitzjs/rpc"
import { LightBulbIcon, NewspaperIcon, CogIcon } from "@heroicons/react/outline"
import AccountMediaObject from "./AccountMediaObject"
import useUserHasPermissionOfAddress from "../hooks/useUserHasPermissionOfAddress"
import { Routes, useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery } from "@blitzjs/rpc"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { toChecksumAddress } from "../utils/checksumAddress"
import WorkspaceNavigationDrawer from "./WorkspaceNavigationDrawer"
import updateAccount from "app/account/mutations/updateAccount"

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

  const [updateAccountMutation] = useMutation(updateAccount)
  const [editingStatus, setEditingStatus] = useState<boolean>(false)
  const [statusText, setStatusText] = useState<string>("")

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
          <div
            className="bg-wet-concrete px-4 py-2 rounded-lg border border-concrete relative"
            onClick={() => {
              console.log(editingStatus)
              if (!editingStatus) {
                setEditingStatus(true)
              }
            }}
          >
            {!editingStatus ? (
              <div
                className="text-base"
                onClick={() => {
                  if (!editingStatus) {
                    console.log("clicked")
                    setEditingStatus(true)
                  }
                }}
              >
                {account?.data.prompt ? (
                  account.data.prompt
                ) : (
                  <span className="text-light-concrete">Looking for proposals for...</span>
                )}
              </div>
            ) : (
              <>
                <textarea
                  onChange={(e) => setStatusText(e.target.value)}
                  className="bg-wet-concrete resize-none min-h-[60px] focus:outline-0"
                  placeholder={"Looking for proposals for..."}
                >
                  {account?.data.prompt && account?.data.prompt}
                </textarea>
                <div className="flex flex-row space-x-2">
                  <Button
                    type={ButtonType.Secondary}
                    onClick={() => {
                      setStatusText("")
                      setEditingStatus(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await updateAccountMutation({
                        address: accountAddress,
                        prompt: statusText,
                      })
                      setEditingStatus(false)
                      // need to invalidate the query, or optomistically update the UI.
                    }}
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
          </div>
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
