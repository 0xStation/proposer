import StationLogo from "public/station-letters.svg"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import { useEffect, useMemo, useState } from "react"
import { Image, invoke, Routes, useQuery, useParam, useRouter, useSession } from "blitz"
import { useAccount } from "wagmi"
import useStore from "../hooks/useStore"
import getTerminalsByAccount from "app/terminal/queries/getTerminalsByAccount"
import { TerminalMetadata } from "app/terminal/types"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import createAccount from "app/account/mutations/createAccount"
import { DEFAULT_PFP_URLS } from "../utils/constants"
import ExploreImageIcon from "public/explore.svg"
import Dropdown from "app/core/components/Dropdown"
import Listbox from "app/core/components/Listbox"
import { useDisconnect, useNetwork, useSwitchNetwork } from "wagmi"
import logout from "app/session/mutations/logout"
import Button from "app/core/components/sds/buttons/Button"
import truncateString from "app/core/utils/truncateString"
import { ChevronDownIcon, DotsHorizontalIcon, PlusIcon } from "@heroicons/react/solid"
import NewWorkspaceModal from "app/core/components/NewWorkspaceModal"

const {
  FEATURE: { WALLET_CONNECTION },
} = TRACKING_EVENTS

const Navigation = ({ children }: { children?: any }) => {
  const session = useSession({ suspense: false })
  const accountData = useAccount()
  const activeUser = useStore((state) => state.activeUser)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const router = useRouter()
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const { chains, switchNetwork } = useSwitchNetwork()
  const [newWorkspaceModalOpen, setNewWorkspaceModalOpen] = useState<boolean>(false)

  const handleDisconnect = async () => {
    setActiveUser(null)
    await invoke(logout, {})
    disconnect()
  }

  // If the user connects + signs their wallet,
  // set the active user. The active user will be
  // set to `null` if there isn't an existing account.
  useEffect(() => {
    if (session?.siwe?.address && !activeUser) {
      const setActiveAccount = async () => {
        const account = await invoke(getAccountByAddress, { address: session?.siwe?.address })
        if (!account) {
          const newUser = await invoke(createAccount, {
            address: session?.siwe?.address,
            createSession: true,
          })
          setActiveUser(newUser)
          router.push(`/profile/complete`)
        } else {
          setActiveUser(account)
        }
      }
      setActiveAccount()
    }
  }, [session?.siwe?.address])

  const [usersTerminals] = useQuery(
    getTerminalsByAccount,
    { accountId: activeUser?.id as number },
    { suspense: false, enabled: !!activeUser?.id }
  )

  const terminalsView =
    usersTerminals && Array.isArray(usersTerminals) && usersTerminals?.length > 0
      ? usersTerminals?.map((terminal, idx) => (
          <TerminalIcon terminal={terminal} key={`${terminal.handle}${idx}`} />
        ))
      : null

  return (
    <>
      <NewWorkspaceModal isOpen={newWorkspaceModalOpen} setIsOpen={setNewWorkspaceModalOpen} />
      <div className="w-full border-b border-concrete h-[70px] px-6 flex items-center justify-between">
        <a className="mt-1 inline-block" href="https://app.station.express">
          <Image src={StationLogo} alt="Station logo" height={30} width={80} />
        </a>
        <div className="flex flex-row items-center space-x-4">
          <Listbox
            defaultValue={chain}
            items={chains}
            onChange={(item) => switchNetwork?.(item.id)}
          />
          {!address ? (
            <Button onClick={() => toggleWalletModal(true)}>Connect</Button>
          ) : (
            <Dropdown
              buttonClassName="border border-marble-white px-2 h-[35px] inline-flex w-full justify-center items-center rounded-md text-sm"
              button={
                <>
                  <span className="block text-marble-white">{truncateString(address)}</span>
                  <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                </>
              }
              items={[{ name: "Disconnect", onClick: () => handleDisconnect() }]}
            />
          )}
          <Dropdown
            button={
              <DotsHorizontalIcon className="inline-block h-4 w-4 fill-marble-white hover:cursor-pointer hover:fill-concrete" />
            }
            items={[
              {
                name: "Product manual",
                href: "https://www.notion.so/0xstation/Legal-Privacy-a3b8da1a13034d1eb5f81482ec637176",
              },
              { name: "Help desk", href: "https://6vdcjqzyfj3.typeform.com/to/F0QFs9aC" },
              { name: "Newstand", href: "https://station-labs.gitbook.io/station-product-manual/" },
              {
                name: "Legal & Privacy",
                href: "https://www.notion.so/0xstation/Legal-Privacy-a3b8da1a13034d1eb5f81482ec637176",
              },
            ]}
          />
        </div>
      </div>
      <div className="h-[calc(100vh-70px)] w-[70px] bg-tunnel-black border-r border-concrete fixed top-[70px] left-0 text-center flex flex-col">
        <div className="h-full mt-4">
          <ExploreIcon />
          <NewWorkspaceIcon onClick={setNewWorkspaceModalOpen} />
          {terminalsView}
        </div>
      </div>
      <div className="h-[calc(100vh-70px)] ml-[70px] relative overflow-y-scroll">{children}</div>
    </>
  )
}

const TerminalIcon = ({ terminal }) => {
  const terminalHandle = useParam("terminalHandle", "string") as string
  const isTerminalSelected = terminalHandle === terminal.handle
  const router = useRouter()
  return (
    <div className="relative flex items-center justify-center group">
      <span
        className={`${
          isTerminalSelected ? "scale-100" : "scale-0 group-hover:scale-75"
        }  absolute w-[3px] h-[46px] min-w-max left-0 rounded-r-lg inline-block mr-2 mb-4
    bg-marble-white
    transition-all duration-200 origin-left`}
      />
      <button
        className={`${
          isTerminalSelected ? "border-marble-white" : "border-wet-concrete"
        } inline-block overflow-hidden cursor-pointer border group-hover:border-marble-white rounded-lg mb-4`}
        onClick={() => router.push(Routes.BulletinPage({ terminalHandle: terminal.handle }))}
      >
        {(terminal?.data as TerminalMetadata)?.pfpURL ? (
          <img
            className="object-fill w-[46px] h-[46px]"
            src={(terminal?.data as TerminalMetadata)?.pfpURL}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
            }}
          />
        ) : (
          <span className="w-[46px] h-[46px] bg-gradient-to-b  from-neon-blue to-torch-red block rounded-lg" />
        )}
      </button>
    </div>
  )
}

const NewWorkspaceIcon = ({ onClick }) => {
  return (
    <button
      className={`bg-wet-concrete hover:border-marble-white border-wet-concrete inline-flex overflow-hidden cursor-pointer border group-hover:border-marble-white rounded-lg h-[47px] w-[47px] mb-4 items-center justify-center`}
      onClick={() => onClick(true)}
    >
      <PlusIcon className="h-6 w-6" aria-hidden="true" />
    </button>
  )
}

const ExploreIcon = () => {
  const exploreSelected =
    typeof window !== "undefined" &&
    window?.location?.pathname === Routes.ExploreStations().pathname
  const router = useRouter()
  return (
    <div className="relative flex items-center justify-center group">
      <span
        className={`${
          exploreSelected ? "scale-100" : "scale-0 group-hover:scale-75"
        }  absolute w-[3px] h-[46px] min-w-max left-0 rounded-r-lg inline-block mr-2 mb-4
bg-marble-white
transition-all duration-200 origin-left`}
      />
      <button
        className={`${
          exploreSelected ? "border-marble-white" : "border-wet-concrete"
        } inline-block overflow-hidden cursor-pointer border group-hover:border-marble-white rounded-lg h-[47px] mb-4`}
        onClick={() => router.push(Routes.ExploreStations())}
      >
        <Image src={ExploreImageIcon} alt="Explore icon" height={46} width={46} />
      </button>
    </div>
  )
}

export default Navigation
