import { useState, useEffect } from "react"
import {
  BlitzPage,
  GetServerSideProps,
  getSession,
  invoke,
  useRouter,
  Routes,
  useParam,
  useQuery,
  useRouterQuery,
} from "blitz"
import { track } from "@amplitude/analytics-browser"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import Navigation from "app/terminal/components/settings/navigation"
import getCheckbooksByTerminal from "app/checkbook/queries/getCheckbooksByTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { Checkbook } from "app/checkbook/types"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import truncateString from "app/core/utils/truncateString"
import { ClipboardIcon, ClipboardCheckIcon, ExternalLinkIcon } from "@heroicons/react/outline"
import networks from "app/utils/networks.json"
import CheckbookIndicator from "app/core/components/CheckbookIndicator"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"
import { AddFundsModal } from "app/core/components/AddFundsModal"
import useStore from "app/core/hooks/useStore"

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  const session = await getSession(req, res)

  if (!session?.userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  const terminal = await invoke(getTerminalByHandle, { handle: params?.terminalHandle as string })

  const hasTagAdminPermissions = await invoke(hasAdminPermissionsBasedOnTags, {
    terminalId: terminal?.id as number,
    accountId: session?.userId as number,
  })

  if (
    !terminal?.data?.permissions?.accountWhitelist?.includes(session?.siwe?.address as string) &&
    !hasTagAdminPermissions
  ) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
}

const CheckbookSettingsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const { creationSuccess } = useRouterQuery()
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const [checkbooks, setCheckbooks] = useState<Checkbook[]>([])
  const [selectedCheckbook, setSelectedCheckbook] = useState<Checkbook>()
  const [isClipboardAddressCopied, setIsClipboardAddressCopied] = useState<boolean>(false)
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(!!creationSuccess)
  const [showAddFundsModal, setShowAddFundsModal] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser)
  const router = useRouter()

  const [books, { isSuccess: finishedFetchingCheckbooks }] = useQuery(
    getCheckbooksByTerminal,
    { terminalId: terminal?.id as number },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      onSuccess: (books) => {
        if (!books || (Array.isArray(books) && books.length === 0)) {
          return
        }
        setCheckbooks(books as unknown as Checkbook[])
        if (!selectedCheckbook) {
          // set defaulted checkbook as last so that newly created ones automatically shown on redirect
          setSelectedCheckbook(books[(books as unknown as Checkbook[])?.length - 1])
        }
      },
    }
  )

  useEffect(() => {
    if (finishedFetchingCheckbooks) {
      track("checkbook_settings_page_shown", {
        event_category: "impression",
        page: "checkbook_settings_page",
        station_name: terminalHandle,
        address: activeUser?.address,
        num_checkbooks: books?.length,
      })
    }
  }, [finishedFetchingCheckbooks])

  const CheckbookComponent = ({ checkbook }) => {
    return (
      <div
        tabIndex={0}
        className={`flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer ${
          checkbook.address === selectedCheckbook?.address ? "bg-wet-concrete" : ""
        }`}
        onClick={() => setSelectedCheckbook(checkbook)}
      >
        <div className="flex space-x-2">
          <div className="flex flex-col content-center">
            <div className="flex flex-row items-center space-x-1">
              <p className="text-lg text-marble-white font-bold">{checkbook.name}</p>
            </div>
            <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
              <p className="w-max">{checkbook.address}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <AddFundsModal
          setIsOpen={setShowAddFundsModal || setSuccessModalOpen}
          isOpen={showAddFundsModal || successModalOpen}
          checkbookAddress={selectedCheckbook?.address}
          pageName="checkbook_settings_page"
          stationName={terminalHandle}
        />
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-concrete flex justify-between">
            <div className="flex flex-col">
              <h2 className="text-marble-white text-2xl font-bold">Checkbook</h2>
              <h5 className="text-base mt-2">
                Checkbook allows you to create checks for fund recipients to cash.{" "}
                <a
                  href="https://station-labs.gitbook.io/station-product-manual/for-daos-communities/checkbook"
                  className="text-electric-violet"
                >
                  Learn more
                </a>
              </h5>
            </div>
            <button
              className="rounded text-tunnel-black px-8 h-[32px] bg-electric-violet self-start"
              onClick={() => {
                track("checkbook_show_create_page_clicked", {
                  event_category: "click",
                  page: "checkbook_settings_page",
                  station_name: terminalHandle,
                  address: activeUser?.address,
                  num_checkbooks: books?.length,
                })
                router.push(Routes.NewCheckbookSettingsPage({ terminalHandle }))
              }}
            >
              Create
            </button>
          </div>
          {checkbooks.length === 0 ? (
            <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
              <p className="text-2xl font-bold w-[295px] text-center">No checkbooks found</p>
              <p className="text-base w-[320px] text-center">
                Click the button above to create your first checkbook.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-7 h-[calc(100vh-115px)] w-full box-border">
              <div className="overflow-y-auto col-span-4">
                {checkbooks.map((checkbook) => {
                  return <CheckbookComponent checkbook={checkbook} key={checkbook.address} />
                })}
              </div>
              {checkbooks.length > 0 && (
                <div className="h-full border-l border-concrete col-span-3">
                  <div className="m-5 flex-col">
                    <div className="flex space-x-2">
                      <div className="flex flex-col content-center">
                        <div className="flex flex-row items-center space-x-1">
                          <div className="text-lg text-marble-white font-bold">
                            {selectedCheckbook?.name}
                          </div>
                        </div>
                        <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                          <div className="w-max truncate leading-4">
                            {selectedCheckbook?.address}
                          </div>
                          <a
                            href={`${
                              networks[selectedCheckbook?.chainId as number].explorer
                            }/address/${selectedCheckbook?.address as string}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLinkIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                          </a>
                          <div>
                            <button
                              onClick={() => {
                                navigator.clipboard
                                  .writeText(selectedCheckbook?.address as string)
                                  .then(() => {
                                    setIsClipboardAddressCopied(true)
                                    setTimeout(() => setIsClipboardAddressCopied(false), 3000)
                                  })
                              }}
                            >
                              {isClipboardAddressCopied ? (
                                <>
                                  <ClipboardCheckIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                                </>
                              ) : (
                                <ClipboardIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                              )}
                            </button>
                            {isClipboardAddressCopied && (
                              <span className="text-[.5rem] uppercase font-bold tracking-wider rounded px-1 absolute text-marble-white bg-wet-concrete">
                                copied!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6 mt-9">
                      <div>
                        <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                          Chain
                        </h3>
                        <p className="mt-2">{networks[selectedCheckbook?.chainId!].name}</p>
                      </div>
                      <div>
                        <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                          Signers
                        </h3>
                        {
                          // dynamically populate addresses later
                          (selectedCheckbook?.signerAccounts || []).map((account, i) => (
                            <div key={i} className="flex flex-row mt-4">
                              <div className="flex flex-col content-center align-middle mr-3">
                                {account.data.pfpURL ? (
                                  <img
                                    src={account.data.pfpURL}
                                    alt="PFP"
                                    className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
                                    onError={(e) => {
                                      e.currentTarget.src = DEFAULT_PFP_URLS.USER
                                    }}
                                  />
                                ) : (
                                  <div className="h-[46px] min-w-[46px] place-self-center border border-wet-concrete bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
                                )}
                              </div>
                              <div className="flex flex-col content-center">
                                <div className="flex flex-row items-center space-x-1">
                                  <p className="text-base text-marble-white font-bold">
                                    {account.data.name}
                                  </p>
                                </div>
                                <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                                  <p className="w-max truncate leading-4">
                                    @{truncateString(account.address)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                      <div>
                        <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                          Approval Quorum
                        </h3>
                        <p className="mt-2">{selectedCheckbook?.quorum || 1}</p>
                      </div>
                      <div>
                        <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                          Funds
                        </h3>
                        {/* <p className="mt-2">
                        There are no funds available to deploy. Copy the contract address and
                        transfer funds to this Checkbook from Gnosis or other wallet applications.
                      </p>
                      <button
                        type="button"
                        className="text-electric-violet border border-electric-violet w-40 mt-3 py-1 px-4 rounded hover:opacity-75"
                        onClick={() =>
                          navigator.clipboard
                            .writeText(selectedCheckbook?.address as string)
                            .then(() => {
                              setIsButtonAddressCopied(true)
                              setTimeout(() => setIsButtonAddressCopied(false), 3000)
                            })
                        }
                      >
                        {isButtonAddressCopied ? "Copied!" : "Copy Address"}
                      </button> */}
                        <CheckbookIndicator checkbook={selectedCheckbook} terminal={terminal} />
                        <button
                          className="border border-electric-violet rounded text-electric-violet px-6 h-[35px] mt-2 hover:bg-wet-concrete mt-4"
                          onClick={() => setShowAddFundsModal(true)}
                        >
                          Add funds
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

export default CheckbookSettingsPage
