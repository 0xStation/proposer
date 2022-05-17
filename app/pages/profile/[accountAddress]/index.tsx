import { useState, useEffect } from "react"
import { BlitzPage, useRouter, useParam, useQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import Modal from "app/core/components/Modal"
import ProfileNavigation from "app/profile/components/Navigation"
import getTerminalsByAccount from "app/terminal/queries/getTerminalsByAccount"
import { Terminal } from "app/terminal/types"

// the profile homepage
// can see a users terminals + profile info at a glance
const ProfileHome: BlitzPage = () => {
  const accountAddress = useParam("accountAddress", "string") as string
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null)
  const activeUser = useStore((state) => state.activeUser)

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    { enabled: !!accountAddress, suspense: false }
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

  if (!account) {
    // TODO: replace with pulsating loading state
    return (
      <div className="mx-auto max-w-2xl py-12">
        <h1 className="text-marble-white text-3xl text-center">Loading...</h1>
      </div>
    )
  }

  return (
    <Layout title={`${account ? `${account?.data?.name} | ` : ""}Profile`}>
      <ProfileNavigation account={activeUser}>
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
                  account={account}
                  terminal={terminal}
                  setSelectedTerminal={setSelectedTerminal}
                />
              ))}
          </div>
          <SelectedTerminalCard account={account} terminal={selectedTerminal} />
        </div>
      </ProfileNavigation>
    </Layout>
  )
}

const TerminalComponent = ({ account, terminal, setSelectedTerminal }) => {
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
            className="min-w-[46px] h-[46px] rounded-md cursor-pointer border border-wet-concrete"
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
            <img
              src={terminal.data.pfpURL}
              alt="Terminal PFP"
              className="min-w-[46px] h-[46px] rounded-md cursor-pointer border border-wet-concrete"
            />
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
              <p className="text-base">{membership.joinedAt.toDateString()}</p>
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

const DiscordModal = ({ isOpen, setIsOpen }) => (
  <Modal open={isOpen} toggle={setIsOpen}>
    <div className="text-center">
      <h1 className="text-2xl m-7 text-center font-bold w-80 mx-auto">
        Connect your Station profile with Discord
      </h1>
      <p className="text-base mx-14 m-7 text-center">
        Connecting your Station profile with Discord to showcase your membership in communities on
        Station.
      </p>
      <a href="https://discord.com/api/oauth2/authorize?client_id=963465926353752104&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fdiscord%2Fexchange-code&response_type=code&scope=identify%20email%20guilds%20guilds.join">
        <button className="text-center border border-marble-white rounded w-96 mx-auto py-1 mb-3">
          Connect with Discord
        </button>
      </a>
    </div>
  </Modal>
)

ProfileHome.suppressFirstRenderFlicker = true

export default ProfileHome
