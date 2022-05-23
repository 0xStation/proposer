import { useState, useEffect } from "react"
import { BlitzPage, useParam, useQuery, Routes, Link } from "blitz"
import Layout from "app/core/layouts/Layout"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import ConnectDiscordProfileModal from "app/core/components/ConnectDiscordProfileModal"
import ProfileNavigation from "app/profile/components/Navigation"
import getTerminalsByAccount from "app/terminal/queries/getTerminalsByAccount"
import { Terminal } from "app/terminal/types"
import { formatDate } from "app/core/utils/formatDate"
import useLocalStorage from "app/core/hooks/useLocalStorage"
import useStore from "app/core/hooks/useStore"
import { Auth } from "app/auth/types"

// the profile homepage
// can see a users terminals + profile info at a glance
const ProfileHome: BlitzPage = () => {
  const accountAddress = useParam("accountAddress", "string") as string
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null)
  const [isConnectDiscordModalOpen, setIsConnectDiscordModalOpen] = useState<boolean>(false)
  const [discordAuthToken] = useLocalStorage<Auth | undefined>(
    "dc_auth_identify guilds",
    undefined,
    false
  )
  const activeUser = useStore((state) => state.activeUser)
  const [firstRender, setFirstRender] = useState<boolean>(true)

  // TODO: useLocalStorage doesn't return us the updated authentication value
  // so just manually setting it for now, but we can prob change it to use a hook
  // or something.
  const [newAuth, setNewAuth] = useState<string | undefined>()

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    { enabled: !!accountAddress, suspense: false, refetchOnWindowFocus: false }
  )

  const [terminals] = useQuery(
    getTerminalsByAccount,
    { accountId: account?.id as number },
    {
      enabled: !!account?.id,
      suspense: false,
      refetchOnWindowFocus: false,
      onSuccess: (terminals: Terminal[]) => {
        if (terminals && terminals.length > 0) {
          setSelectedTerminal(terminals[0] || null)
        }
      },
    }
  )

  useEffect(() => {
    // suppress first render flicker of the connect discord modal
    setFirstRender(false)
  }, [])

  useEffect(() => {
    if (!firstRender && activeUser && account?.id === activeUser.id) {
      if (!activeUser?.discordId && !discordAuthToken?.authorization && !newAuth) {
        setIsConnectDiscordModalOpen(true)
      }
    }
  }, [account, activeUser, discordAuthToken?.authorization, firstRender])

  return (
    <Layout title={`${account ? `${account?.data?.name} | ` : ""}Profile`}>
      <ConnectDiscordProfileModal
        isOpen={isConnectDiscordModalOpen}
        setIsOpen={setIsConnectDiscordModalOpen}
        activeUser={activeUser}
        setNewAuth={setNewAuth}
      />
      <ProfileNavigation account={account} terminals={terminals}>
        {terminals && terminals.length ? (
          <>
            <div className="h-[108px] border-b border-concrete">
              <h1 className="text-2xl font-bold ml-6 pt-6">Terminals</h1>
              <p className="flex ml-6 pt-2">Communities you&apos;re a part of </p>
            </div>
            <div className="grid grid-cols-7 h-full w-full">
              <div className="overflow-y-auto h-full col-span-4">
                {terminals &&
                  terminals.map((terminal, idx) => (
                    <TerminalComponent
                      key={`${terminal.handle}${idx}`}
                      terminal={terminal}
                      setSelectedTerminal={setSelectedTerminal}
                    />
                  ))}
              </div>
              <SelectedTerminalCard account={account} terminal={selectedTerminal} />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center flex-col justify-center">
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

const TerminalComponent = ({ terminal, setSelectedTerminal }) => {
  return (
    <div
      tabIndex={0}
      className="flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer"
      onClick={() => setSelectedTerminal(terminal)}
    >
      <div className="flex space-x-2">
        <div className="flex flex-col content-center align-middle mr-1">
          <img
            src={terminal.data.pfpURL}
            alt="Terminal PFP"
            className="min-w-[46px] max-w-[46px] h-[46px] rounded-md cursor-pointer border border-wet-concrete"
          />
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

const SelectedTerminalCard = ({ account, terminal }) => {
  if (!account || !terminal) return null

  const membership = account.tickets.find((ticket) => ticket.terminalId === terminal.id)

  const statusTags = membership.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "status"
  )

  const roleTags = membership.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "role"
  )
  const initiativeTags = membership.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "initiative"
  )
  const guildTags = membership.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "guild"
  )

  return (
    <div className="h-full border-l border-concrete col-span-3">
      <div className="m-5 flex-col">
        <div className="flex space-x-2">
          <div className="flex flex-col content-center align-middle mr-1">
            <Link href={Routes.MemberDirectoryPage({ terminalHandle: terminal.handle })}>
              <img
                src={terminal.data.pfpURL}
                alt="Terminal PFP"
                className="min-w-[46px] max-w-[46px] h-[46px] rounded-md cursor-pointer border border-wet-concrete hover:border-marble-white"
              />
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
        <div className="mt-9 text-xs">
          <TagDetails tagType="status" tags={statusTags} />
          {membership.joinedAt && (
            <div className="mt-7">
              <p className="uppercase mb-3">joined since</p>
              <p className="text-base">{formatDate(membership.joinedAt)}</p>
            </div>
          )}
          <TagDetails tagType="roles" tags={roleTags} />
          <TagDetails tagType="initiatives" tags={initiativeTags} />
          <TagDetails tagType="guilds" tags={guildTags} />
        </div>
      </div>
    </div>
  )
}

const TagDetails = ({ tagType, tags }: { tagType: string; tags: any[] }) => {
  if (!tags.length) return null

  return (
    <div className="mt-7">
      <p className="uppercase mb-3">{tagType}</p>
      <div className="flex-row space-x-2">
        {tags.map((accountTerminalTag) => {
          return (
            <span
              key={accountTerminalTag.tag.value}
              className="rounded-full py-1 px-3 bg-wet-concrete uppercase font-bold"
            >
              {accountTerminalTag.tag.value}
            </span>
          )
        })}
      </div>
    </div>
  )
}

ProfileHome.suppressFirstRenderFlicker = true

export default ProfileHome
