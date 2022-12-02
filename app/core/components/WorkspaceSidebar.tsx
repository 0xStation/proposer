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
import ExpandingTextArea from "./sds/form/ExpandingTextarea"

export const WorkspaceSidebar = () => {
  const router = useRouter()
  const accountAddress = useParam("accountAddress", "string") as string
  const [isWorkspaceDrawerOpen, setIsWorkspaceDrawerOpen] = useState<boolean>(false)
  const [account, { setQueryData }] = useQuery(
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

  const [updateAccountMutation, { isLoading }] = useMutation(updateAccount)
  const [currentlyEditingStatus, setCurrentlyEditingStatus] = useState<boolean>(false)
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
      <div className="hidden md:block h-full min-w-[288px] max-w-[288px] border-r border-concrete p-6">
        <div className="pb-6 border-b border-wet-concrete space-y-4">
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
          {(hasPrivateAccess || account?.data?.prompt) && (
            <div
              className="bg-wet-concrete px-4 py-2 rounded-lg relative cursor-pointer"
              onClick={() => {
                if (!currentlyEditingStatus && hasPrivateAccess) {
                  setCurrentlyEditingStatus(true)
                }
              }}
            >
              <svg
                width="20"
                height="10"
                viewBox="0 0 95 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-[-9px]"
              >
                <path
                  d="M45.9422 0.933843C46.7427 -0.0600909 48.2568 -0.0600873 49.0574 0.933847L93.8089 56.4955C94.8627 57.8039 93.9314 59.75 92.2513 59.75H2.74827C1.06818 59.75 0.136799 57.8039 1.19068 56.4955L45.9422 0.933843Z"
                  fill="#2E2E2E"
                />
              </svg>
              {!currentlyEditingStatus ? (
                <div className="text-base">
                  {account?.data.prompt ? (
                    <div className="flex flex-col space-y-4">
                      <span>{account.data.prompt}</span>
                      {hasPrivateAccess && (
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            account?.data.prompt
                          )}%20https://www.app.station.express/workspace/${account?.address}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="text-electric-violet font-bold self-start"
                          rel="noreferrer"
                        >
                          Tweet
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-light-concrete">Looking for proposals for...</span>
                  )}
                </div>
              ) : (
                <>
                  <ExpandingTextArea
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    className="bg-wet-concrete resize-none focus:outline-0 w-full"
                    placeholder={"Looking for proposals for..."}
                  />
                  <div className="flex flex-row space-x-2">
                    <Button
                      type={ButtonType.Secondary}
                      onClick={() => {
                        setCurrentlyEditingStatus(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (account) {
                          setQueryData({
                            ...account,
                            data: {
                              ...(account.data as any),
                              prompt: statusText,
                            },
                          })
                        }
                        const updatedAccount = await updateAccountMutation({
                          address: accountAddress,
                          prompt: statusText,
                        })
                        setQueryData(updatedAccount)
                        setCurrentlyEditingStatus(false)
                      }}
                      isLoading={isLoading}
                    >
                      Save
                    </Button>
                  </div>
                </>
              )}
            </div>
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
