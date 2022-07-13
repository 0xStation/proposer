import { useState, Fragment, useEffect } from "react"
import { BlitzPage, useParam, useQuery, Routes, Link, Image } from "blitz"
import { Dialog, Transition } from "@headlessui/react"
import Layout from "app/core/layouts/Layout"
import Exit from "/public/exit-button.svg"
import getAccountByDiscordId from "app/account/queries/getAccountByDiscordId"
import ConnectDiscordProfileModal from "app/core/components/ConnectDiscordProfileModal"
import ProfileNavigation from "app/profile/components/Navigation"
import getTerminalsByAccount from "app/terminal/queries/getTerminalsByAccount"
import { Terminal } from "app/terminal/types"
import { formatDate } from "app/core/utils/formatDate"
import useLocalStorage from "app/core/hooks/useLocalStorage"
import useStore from "app/core/hooks/useStore"
import { Auth } from "app/auth/types"
import { Account } from "app/account/types"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import useKeyPress from "app/core/hooks/useKeyPress"

// the profile homepage
// can see a users terminals + profile info at a glance
const DiscordProfileHome: BlitzPage = () => {
  const discordId = useParam("discordId", "string") as string
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null)
  const [isConnectDiscordModalOpen, setIsConnectDiscordModalOpen] = useState<boolean>(false)
  const [discordAuthToken] = useLocalStorage<Auth | undefined>(
    "dc_auth_identify guilds",
    undefined,
    false
  )
  const [mobileTerminalDrawerIsOpen, setMobileTerminalDrawerIsOpen] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser)

  // TODO: useLocalStorage doesn't return us the updated authentication value
  // so just manually setting it for now, but we can prob change it to use a hook
  // or something.
  const [newAuth, setNewAuth] = useState<string | undefined>()

  const [account] = useQuery(
    getAccountByDiscordId,
    { discordId: discordId },
    { enabled: !!discordId, suspense: false, refetchOnWindowFocus: false }
  )

  const [terminals] = useQuery(
    getTerminalsByAccount,
    { accountId: account?.id as number },
    {
      enabled: !!account?.id,
      suspense: false,
      refetchOnWindowFocus: false,
      onSuccess: (terminals: Terminal[]) => {
        if (terminals && terminals.length > 0 && !selectedTerminal) {
          setSelectedTerminal(terminals[0] || null)
        }
      },
    }
  )

  const downPress = useKeyPress("ArrowDown")
  const upPress = useKeyPress("ArrowUp")
  const enterPress = useKeyPress("Enter")
  const [cursor, setCursor] = useState(0)
  const [hovered, setHovered] = useState(undefined)

  useEffect(() => {
    if (terminals?.length && downPress) {
      setCursor((prevState) => (prevState < terminals?.length - 1 ? prevState + 1 : prevState))
      setSelectedTerminal(terminals[cursor] ?? null)
    }
  }, [downPress])

  useEffect(() => {
    if (terminals?.length && upPress) {
      setCursor((prevState) => (prevState > 0 ? prevState - 1 : prevState))
      setSelectedTerminal(terminals[cursor] ?? null)
    }
  }, [upPress])

  useEffect(() => {
    if (terminals?.length && enterPress) {
      setSelectedTerminal(terminals[cursor] ?? null)
    }
  }, [cursor, enterPress])

  useEffect(() => {
    if (terminals?.length && hovered) {
      setCursor(terminals?.indexOf(hovered))
    }
  }, [hovered])

  return (
    <Layout title={`${account ? `${account?.data?.name} | ` : ""}Profile`}>
      <ConnectDiscordProfileModal
        isOpen={isConnectDiscordModalOpen}
        setIsOpen={setIsConnectDiscordModalOpen}
        activeUser={activeUser}
        setNewAuth={setNewAuth}
      />
      <ProfileNavigation
        account={account as Account}
        setIsConnectDiscordModalOpen={setIsConnectDiscordModalOpen}
      >
        {terminals && terminals.length ? (
          <>
            <div className="h-[108px] border-b border-concrete">
              <h1 className="text-2xl font-bold ml-6 pt-6">Terminals</h1>
              <p className="flex ml-6 pt-2">{`${account?.data?.name}'s communities`} </p>
            </div>
            <div className="grid grid-cols-7 h-[calc(100vh-108px)] w-full">
              <div className="overflow-y-auto h-full col-span-7 sm:col-span-4">
                {terminals &&
                  terminals.map((terminal, idx) => (
                    <TerminalComponent
                      key={`${terminal.handle}${idx}`}
                      terminal={terminal}
                      selectedTerminal={selectedTerminal}
                      setSelectedTerminal={setSelectedTerminal}
                      setMobileTerminalDrawerIsOpen={setMobileTerminalDrawerIsOpen}
                      setHovered={setHovered}
                    />
                  ))}
              </div>
              <SelectedTerminalCard
                account={account}
                terminal={selectedTerminal}
                setMobileTerminalDrawerIsOpen={setMobileTerminalDrawerIsOpen}
                mobileTerminalDrawerIsOpen={mobileTerminalDrawerIsOpen}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
            <h1 className="text-2xl font-bold text-marble-white text-center">Coming Soon</h1>
            <p className="my-2 w-[309px]">
              Station is still in private beta. You can{" "}
              <a
                className="text-magic-mint"
                href="https://twitter.com/messages/compose?recipient_id=1412594810985271296"
                target="_blank"
                rel="noopener noreferrer"
              >
                DM us
              </a>{" "}
              to learn more or{" "}
              <a
                className="text-magic-mint"
                href="https://6vdcjqzyfj3.typeform.com/to/Ik09gzw6"
                target="_blank"
                rel="noopener noreferrer"
              >
                sign up on our waitlist
              </a>
              .
            </p>
          </div>
        )}
      </ProfileNavigation>
    </Layout>
  )
}

const TerminalComponent = ({
  terminal,
  selectedTerminal,
  setSelectedTerminal,
  setMobileTerminalDrawerIsOpen,
  setHovered,
}) => {
  return (
    <div
      tabIndex={0}
      className={`flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer ${
        selectedTerminal?.id === terminal?.id ? "bg-wet-concrete" : ""
      }`}
      onClick={() => {
        setSelectedTerminal(terminal)
        setMobileTerminalDrawerIsOpen(true)
      }}
      onMouseEnter={() => setHovered(terminal)}
      onMouseLeave={() => setHovered(undefined)}
    >
      <div className="flex space-x-2">
        <div className="flex flex-col content-center align-middle mr-1">
          {terminal.data.pfpURL ? (
            <img
              src={terminal.data.pfpURL}
              alt="Terminal PFP"
              className="min-w-[46px] max-w-[46px] h-[46px] rounded-md cursor-pointer border border-wet-concrete"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
              }}
            />
          ) : (
            <span className="w-[46px] h-[46px] rounded-md cursor-pointer border border-wet-concrete bg-gradient-to-b from-neon-blue to-torch-red" />
          )}
        </div>
        <div className="flex flex-col content-center">
          <div className="flex flex-row items-center space-x-1">
            <p className="text-lg text-marble-white font-bold">{terminal.data.name}</p>
          </div>
          <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
            <p className="w-max truncate leading-4">@{terminal.handle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const SelectedTerminalCard = ({
  account,
  terminal,
  setMobileTerminalDrawerIsOpen,
  mobileTerminalDrawerIsOpen,
}) => {
  if (!account || !terminal) return null

  const membership = account.tickets.find((ticket) => ticket.terminalId === terminal.id)

  const statusTags = membership.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "status"
  )
  const roleTags = membership.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "role"
  )
  const projectTags = membership.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "project"
  )
  const guildTags = membership.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "guild"
  )

  const selectedTerminalCardContent = (
    <div className="m-5 flex-col">
      <div className="flex space-x-2">
        <div className="flex flex-col content-center align-middle mr-1">
          <Link href={Routes.MemberDirectoryPage({ terminalHandle: terminal.handle })}>
            {terminal.data.pfpURL ? (
              <img
                src={terminal.data.pfpURL}
                alt="Terminal PFP"
                className="min-w-[46px] max-w-[46px] h-[46px] rounded-md cursor-pointer border border-wet-concrete hover:border-marble-white"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
                }}
              />
            ) : (
              <span className="w-[46px] h-[46px] rounded-md cursor-pointer border border-wet-concrete bg-gradient-to-b from-neon-blue to-torch-red hover:border-marble-white" />
            )}
          </Link>
        </div>
        <div className="flex flex-col content-center">
          <div className="flex flex-row items-center space-x-1">
            <div className="text-lg text-marble-white font-bold">{terminal.data.name}</div>
          </div>
          <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
            <div className="w-max truncate leading-4">@{terminal.handle}</div>
          </div>
        </div>
      </div>
      <div className="mt-7 text-xs">
        <TagDetails tagType="status" tags={statusTags} />
        {membership.joinedAt && (
          <div className="mt-5">
            <p className="uppercase mb-2">joined since</p>
            <p className="text-base">{formatDate(membership.joinedAt)}</p>
          </div>
        )}
        <TagDetails tagType="roles" tags={roleTags} />
        <TagDetails tagType="projects" tags={projectTags} />
        <TagDetails tagType="guilds" tags={guildTags} />
      </div>
    </div>
  )

  return (
    <>
      <div className="h-full border-l border-concrete hidden sm:col-span-3 sm:block">
        {selectedTerminalCardContent}
      </div>
      <Transition.Root show={mobileTerminalDrawerIsOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 overflow-hidden block sm:hidden"
          onClose={setMobileTerminalDrawerIsOpen}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="absolute inset-0 bg-tunnel-black bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="pointer-events-auto w-screen max-w-xs">
                  <div className="flex h-full flex-col overflow-y-scroll bg-tunnel-black border-l border-concrete">
                    <div className="px-4">
                      <>
                        <div className="flex items-start justify-between w-full">
                          <div className="flex justify-between h-7 items-center w-full">
                            <button
                              className="mt-4 mr-4 text-right"
                              onClick={() => setMobileTerminalDrawerIsOpen(false)}
                            >
                              <Image src={Exit} alt="Close button" width={12} height={12} />
                            </button>
                          </div>
                          <Dialog.Title className="text-lg font-medium text-marble-white"></Dialog.Title>
                        </div>
                      </>
                    </div>
                    {selectedTerminalCardContent}
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}

const TagDetails = ({ tagType, tags }: { tagType: string; tags: any[] }) => {
  if (!tags.length) return null

  return (
    <div className="mt-5">
      <p className="uppercase mb-3">
        {tags.length > 1 || tagType === "status" ? tagType : tagType.slice(0, -1)}
      </p>
      <div className="flex-row mt-2 align-left mr-2">
        {tags.map((accountTerminalTag) => {
          return (
            <span
              key={accountTerminalTag.tag.value}
              className="rounded-full py-1 px-3 mr-2 mb-2 bg-wet-concrete uppercase font-bold inline-block"
            >
              {accountTerminalTag.tag.value}
            </span>
          )
        })}
      </div>
    </div>
  )
}

DiscordProfileHome.suppressFirstRenderFlicker = true

export default DiscordProfileHome
