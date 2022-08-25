import { useState } from "react"
import {
  BlitzPage,
  GetServerSideProps,
  Routes,
  useParam,
  useRouter,
  useQuery,
  getSession,
  invoke,
} from "blitz"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import Navigation from "app/terminal/components/settings/navigation"
import getGroupedTagsByTerminalId from "app/tag/queries/getGroupedTagsByTerminalId"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { Tag } from "app/tag/types"
import networks from "app/utils/networks.json"
import hasAdminPermissionsBasedOnTags from "../../../../permissions/queries/hasAdminPermissionsBasedOnTags"
import { ClipboardIcon, ClipboardCheckIcon, ExternalLinkIcon } from "@heroicons/react/outline"
import Button from "app/core/components/sds/buttons/Button"

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

const TokenSettingsPage: BlitzPage = () => {
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const [tokenTags, setTokenTags] = useState<Tag[]>([])
  const [selectedTag, setSelectedTag] = useState<Tag>()
  const [isClipboardAddressCopied, setIsClipboardAddressCopied] = useState<boolean>(false)

  useQuery(
    getGroupedTagsByTerminalId,
    { terminalId: terminal?.id as number },
    {
      suspense: false,
      onSuccess: (groupedTags) => {
        if (!groupedTags || !groupedTags["token"]) {
          return
        }
        setTokenTags(groupedTags["token"])
        if (!selectedTag) {
          setSelectedTag(groupedTags["token"][0])
        }
      },
    }
  )

  const TokenTagComponent = ({ tag }) => {
    return (
      <div
        tabIndex={0}
        className={`flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer ${
          tag.id === selectedTag?.id ? "bg-wet-concrete" : ""
        }`}
        onClick={() => setSelectedTag(tag)}
      >
        <div className="flex space-x-2">
          <div className="flex flex-col content-center">
            <div className="flex flex-row items-center space-x-1">
              <p className="text-lg text-marble-white font-bold">{tag.value}</p>
            </div>
            <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
              {tag.data.address && <p className="w-max truncate leading-4">{tag.data.address}</p>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        {tokenTags.length === 0 ? (
          <div className="w-full h-full flex items-center flex-col justify-center">
            <p className="text-marble-white text-2xl font-bold">Import Tokens</p>
            <p className="mt-2 text-marble-white text-base w-[400px] text-center">
              Import ERC-20s to fund proposals in tokens of your choice.
            </p>
            <Button onClick={() => router.push(Routes.NewTokenSettingsPage({ terminalHandle }))}>
              Import
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-6 border-b border-concrete flex justify-between">
              <div className="flex flex-col">
                <h2 className="text-marble-white text-2xl font-bold">Tokens</h2>
                <h5 className="text-base mt-2">
                  Import tokens that represent your community&apos;s membership and ownership.
                </h5>
              </div>
              <Button onClick={() => router.push(Routes.NewTokenSettingsPage({ terminalHandle }))}>
                Import
              </Button>
            </div>
            <div className="grid grid-cols-7 h-[calc(100vh-115px)] w-full box-border">
              <div className="overflow-y-auto col-span-4">
                {tokenTags.map((tt) => {
                  return <TokenTagComponent tag={tt} key={tt.id} />
                })}
              </div>
              <div className="h-full border-l border-concrete col-span-3">
                <div className="m-5 flex-col">
                  <div className="flex space-x-2">
                    <div className="flex flex-col content-center">
                      <div className="flex flex-row items-center space-x-1">
                        <div className="text-lg text-marble-white font-bold">
                          {selectedTag?.value}
                        </div>
                      </div>
                      <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                        <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                          <div className="w-max truncate leading-4">
                            {selectedTag?.data.address}
                          </div>
                        </div>
                        <a
                          href={`${
                            networks[selectedTag?.data.chainId as number].explorer
                          }/address/${selectedTag?.data.address as string}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLinkIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                        </a>
                        <div>
                          <button
                            onClick={() => {
                              navigator.clipboard
                                .writeText(selectedTag?.data.address as string)
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
                      <p className="mt-2">{networks[selectedTag?.data.chainId].name}</p>
                    </div>
                    <div>
                      <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                        Token Type
                      </h3>
                      <p className="mt-2">{selectedTag?.data.type}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

export default TokenSettingsPage
