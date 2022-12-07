import React, { useState } from "react"
import { useMutation } from "@blitzjs/rpc"
import { LightBulbIcon, NewspaperIcon, CogIcon } from "@heroicons/react/outline"
import AccountMediaObject from "./AccountMediaObject"
import useUserHasPermissionOfAddress from "../hooks/useUserHasPermissionOfAddress"
import { Routes, useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery } from "@blitzjs/rpc"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { toChecksumAddress } from "../utils/checksumAddress"
import WorkspaceNavigationDrawer from "./WorkspaceNavigationDrawer"
import updateAccount from "app/account/mutations/updateAccount"
import ExpandingTextArea from "./sds/form/ExpandingTextarea"
import timeSince from "app/core/utils/timeSince"

export const WorkspaceSidebar = () => {
  const router = useRouter()
  const setToastState = useStore((state) => state.setToastState)
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
              className="bg-wet-concrete px-4 pt-[14px] pb-3 rounded-lg relative cursor-pointer"
              onClick={() => {
                if (!currentlyEditingStatus && hasPrivateAccess) {
                  setCurrentlyEditingStatus(true)
                }
              }}
            >
              <svg
                width="24"
                height="12"
                viewBox="0 0 24 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-[-7px]"
              >
                <path
                  d="M10.001 1.59922C10.7144 1.02847 11.0711 0.743096 11.4667 0.633653C11.8157 0.537115 12.1843 0.537115 12.5333 0.633653C12.9289 0.743096 13.2856 1.02847 13.999 1.59922L19.8765 6.30122C22.0613 8.049 23.1536 8.9229 23.2742 9.68926C23.3785 10.3526 23.143 11.024 22.6471 11.4769C22.0742 12 20.6753 12 17.8775 12H6.1225C3.32468 12 1.92577 12 1.3529 11.4769C0.857045 11.024 0.621518 10.3526 0.725849 9.68926C0.846381 8.9229 1.93875 8.049 4.12348 6.30122L10.001 1.59922Z"
                  fill="#2E2E2E"
                />
              </svg>

              {!currentlyEditingStatus ? (
                <div className="text-base">
                  {account?.data.prompt ? (
                    <div className="flex flex-col space-y-4">
                      {account.data.prompt.text ? (
                        <span>{account.data.prompt.text}</span>
                      ) : (
                        <span className="text-concrete">Looking for proposals to...</span>
                      )}
                      <div className="flex flex-row items-center justify-between w-full">
                        <span className="text-sm text-concrete">
                          {timeSince(new Date(account.data.prompt.updatedAt))}
                        </span>
                        {hasPrivateAccess && (
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                              account?.data.prompt.text
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
                    </div>
                  ) : (
                    <span className="text-light-concrete">
                      Add a status e.g. &quot;Looking for proposals to...&quot;
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <ExpandingTextArea
                    value={statusText}
                    onChange={(e) => {
                      if (e.target.value.length > 200) {
                        setToastState({
                          isToastShowing: true,
                          type: "error",
                          message: "The status cannot be longer than 200 characters.",
                        })
                      } else {
                        setStatusText(e.target.value)
                      }
                    }}
                    className="bg-wet-concrete resize-none focus:outline-0 w-full mb-2 placeholder-concrete"
                    placeholder={"Looking for proposals to..."}
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
                          prompt: {
                            text: statusText,
                            updatedAt: new Date(),
                          },
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
