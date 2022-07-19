import { useState, useEffect } from "react"
import { BlitzPage, useParam, useQuery, Routes, Link, Image } from "blitz"
import Layout from "app/core/layouts/Layout"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import ConnectDiscordProfileModal from "app/core/components/ConnectDiscordProfileModal"
import ProfileNavigation from "app/profile/components/Navigation"
import getTerminalsByAccount from "app/terminal/queries/getTerminalsByAccount"
import { Terminal } from "app/terminal/types"
import { formatDate } from "app/core/utils/formatDate"
import useLocalStorage from "app/core/hooks/useLocalStorage"
import useStore from "app/core/hooks/useStore"
import { Auth } from "app/auth/types"
import { Account } from "app/account/types"
import truncateString from "app/core/utils/truncateString"
import { DEFAULT_PFP_URLS, PROPOSAL_STATUS_DISPLAY_MAP } from "app/core/utils/constants"
import getAccountProposalsByAddress from "app/account/queries/getAccountProposalsByAddress"
import ProgressIndicator from "app/core/components/ProgressIndicator"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { RfpStatus } from "app/rfp/types"

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
  const [hasSeenDiscordConnectModal] = useLocalStorage<boolean>(
    "has_dismissed_discord_connect_modal",
    false,
    true
  )
  const activeUser = useStore((state) => state.activeUser)

  // TODO: useLocalStorage doesn't return us the updated authentication value
  // so just manually setting it for now, but we can prob change it to use a hook
  // or something.
  const [newAuth, setNewAuth] = useState<string | undefined>()

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    { enabled: !!accountAddress, suspense: false, refetchOnWindowFocus: false }
  )

  const [accountProposals] = useQuery(
    getAccountProposalsByAddress,
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
        if (terminals && terminals.length > 0 && !selectedTerminal) {
          setSelectedTerminal(terminals[0] || null)
        }
      },
    }
  )

  useEffect(() => {
    // if it's not the first render, and the activeUser hasn't
    // connected their account, show the connect discord modal.
    if (
      account?.id === activeUser?.id &&
      activeUser &&
      !activeUser?.discordId &&
      !discordAuthToken?.authorization &&
      !newAuth &&
      !hasSeenDiscordConnectModal
    ) {
      setIsConnectDiscordModalOpen(true)
    }
  }, [account, activeUser, discordAuthToken?.authorization])

  return (
    <Layout
      title={`${
        account?.data?.name ? account?.data?.name : truncateString(accountAddress, 3)
      } | Profile`}
    >
      {
        // only show discord popup if I don't have a discordId associated with my account
        // first account check prevents flicker of modal while account is still loading
        activeUser && !activeUser?.discordId && (
          <ConnectDiscordProfileModal
            isOpen={isConnectDiscordModalOpen}
            setIsOpen={setIsConnectDiscordModalOpen}
            activeUser={activeUser}
            setNewAuth={setNewAuth}
          />
        )
      }
      <ProfileNavigation account={account as Account}>
        {terminals && terminals.length ? (
          <>
            <div className="h-[108px] border-b border-concrete">
              <h1 className="text-2xl font-bold ml-6 pt-6">Proposals</h1>
              <p className="flex ml-6 pt-2">{`${account?.data?.name || ""}'s proposals`} </p>
            </div>
            <div className="grid grid-cols-7 h-[calc(100vh-108px)] w-full">
              <div className="overflow-y-auto col-span-7">
                <div className="border-b border-concrete h-[44px] text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
                  <span className="basis-[38rem] ml-6 mb-2 tracking-wider">Proposals</span>
                  <span className="basis-32 ml-2 mb-2 tracking-wider">Approval</span>
                  <span className="basis-28 ml-2 mb-2 tracking-wider">Amount</span>
                  <span className="basis-32 mb-2 tracking-wider">Submission date</span>
                  <span className="basis-32 ml-12 mb-2 tracking-wider">Station</span>
                </div>
                {accountProposals &&
                  accountProposals.map((accountProposal, idx) => (
                    <ProposalComponent
                      key={`${accountProposal.address}${idx}`}
                      accountProposal={accountProposal}
                    />
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
            <h1 className="text-2xl font-bold text-marble-white text-center w-[295px]">
              {account && account?.id === activeUser?.id
                ? "You haven't created any proposals"
                : account?.data?.name
                ? `${account?.data?.name} is not yet a part of any Station`
                : "...Loading"}
            </h1>
            {account?.id === activeUser?.id ? (
              <p className="my-2 w-[309px] text-center">
                Submit your ideas and get funded by DAOs.
              </p>
            ) : (
              <p className="my-2 w-[309px] text-center">
                {account?.data.name || "..."} hasn&apos;t created any proposals
              </p>
            )}
          </div>
        )}
      </ProfileNavigation>
    </Layout>
  )
}

const ProposalComponent = ({ accountProposal }) => {
  const { terminal, proposal } = accountProposal
  const rfp = proposal.rfp
  const checkbook = rfp.checkbook
  const isRfpDeleted = rfp?.status === RfpStatus.DELETED

  return (
    <Link
      href={Routes.ProposalPage({
        terminalHandle: terminal.handle,
        rfpId: proposal.rfpId,
        proposalId: proposal.id,
      })}
    >
      <div className="border-b border-concrete w-full cursor-pointer hover:bg-wet-concrete pt-5">
        <div className="flex flex-row items-center space-x-2 ml-6">
          <span
            className={`h-2 w-2 rounded-full ${
              PROPOSAL_STATUS_DISPLAY_MAP[proposal.status]?.color || "bg-concrete"
            }`}
          />
          <span className="text-xs uppercase tracking-wider font-bold">
            {PROPOSAL_STATUS_DISPLAY_MAP[proposal.status]?.copy}
            {isRfpDeleted && <p className="text-concrete inline"> · rfp has been deleted</p>}
          </span>
        </div>
        <div className="w-full flex flex-row mb-5">
          <div className="basis-[38rem] ml-6 mb-2">
            <h2 className="text-xl mt-2 mb-3">{proposal?.data?.content?.title}</h2>
          </div>
          <div className="basis-32 ml-2 mb-2 self-center">
            <div className="flex flex-row">
              <ProgressIndicator
                percent={proposal.approvals.length / checkbook?.quorum}
                twsize={6}
                cutoff={0}
              />
              <p className="ml-2">
                {`${proposal.approvals.length || "0"} / ${checkbook?.quorum || "N/A"}`}
              </p>
            </div>
          </div>
          <div className="basis-28 ml-2 mb-2 self-center text-marble-white">
            {proposal.data?.funding?.amount || "N/A"}
          </div>
          <div className="basis-32 mb-2 self-center">{formatDate(proposal.createdAt) || "N/A"}</div>
          <div className="basis-32 ml-12 mr-[6px] mb-2 self-center">
            <img
              src={terminal?.data?.pfpURL || DEFAULT_PFP_URLS.TERMINAL}
              alt="PFP"
              className="min-w-[46px] max-w-[46px] h-[46px] rounded cursor-pointer border border-wet-concrete"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

ProfileHome.suppressFirstRenderFlicker = true

export default ProfileHome
