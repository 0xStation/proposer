import Link from "next/link"
import Image from "next/image"
import { useSession } from "@blitzjs/auth"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import { invoke } from "@blitzjs/rpc"
import StationLogo from "public/station-letters.svg"
import { useEffect, useMemo, useState } from "react"
import useStore from "../hooks/useStore"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import createAccount from "app/account/mutations/createAccount"
import Dropdown from "app/core/components/Dropdown"
import Listbox from "app/core/components/Listbox"
import { useDisconnect, useNetwork, useSwitchNetwork, useAccount, allChains } from "wagmi"
import logout from "app/session/mutations/logout"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import truncateString from "app/core/utils/truncateString"
import { LINKS, SUPPORTED_CHAINS, Sizes } from "app/core/utils/constants"
import Avatar from "app/core/components/sds/images/avatar"
import DropdownChevronIcon from "../icons/DropdownChevronIcon"
import { DotsHorizontalIcon, MenuAlt4Icon } from "@heroicons/react/solid"
import NewWorkspaceModal from "app/core/components/NewWorkspaceModal"
import { useEnsName } from "wagmi"
import { NavigationSidebar } from "./NavigationSidebar"
import dynamic from "next/dynamic"

const WorkspaceNavigationDrawer = dynamic(
  () => import("app/core/components/WorkspaceNavigationDrawer"),
  {
    ssr: false,
  }
)

const Navigation = ({ children }: { children?: any }) => {
  const session = useSession({ suspense: false })
  const accountData = useAccount()
  const setActiveChain = useStore((state) => state.setActiveChain)
  const activeUser = useStore((state) => state.activeUser)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const setToastState = useStore((state) => state.setToastState)
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const { switchNetwork, isError, error } = useSwitchNetwork()
  // the useNetwork object weirdly doesn't have the right names, but the objects from allChains do so we convert
  const connectedChain = SUPPORTED_CHAINS.find((supportedChain) => supportedChain.id === chain?.id)
  const isChainSupported = chain ? !!connectedChain : undefined
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false)
  const [newWorkspaceModalOpen, setNewWorkspaceModalOpen] = useState<boolean>(false)
  const router = useRouter()

  if (isError) {
    setToastState({
      isToastShowing: true,
      type: "error",
      message: error?.message,
    })
  }

  const handleDisconnect = async () => {
    await invoke(logout, {})
    disconnect()
    setActiveUser(null)
  }

  // If the user connects + signs their wallet,
  // set the active user. The active user will be
  // set to `null` if there isn't an existing account.
  useEffect(() => {
    // sometimes on page loads, the session object isn't populated yet
    // protect against setting an incorrect user with short-circuit
    if (!session?.siwe?.address) {
      return
    }
    if (session?.siwe?.address !== activeUser?.address) {
      const setActiveAccount = async () => {
        const account = await invoke(getAccountByAddress, { address: session?.siwe?.address })
        if (!account) {
          const newUser = await invoke(createAccount, {
            address: session?.siwe?.address,
            createSession: true,
          })
          setActiveUser(newUser)
        } else {
          setActiveUser(account)
        }
      }
      setActiveAccount()
    }
  }, [session?.siwe?.address])

  // sets activeChain in the store in the case that the user is connected
  // otherwise, changing the chain while logged out will auto trigger a write to the store
  useEffect(() => {
    if (chain) {
      setActiveChain(chain)
    }
  }, [chain])

  const { data: ensName } = useEnsName({
    address: activeUser?.address as `0x${string}`,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
    enabled: !!activeUser,
  })

  return (
    <>
      {activeUser && (
        <WorkspaceNavigationDrawer
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
          account={activeUser}
        />
      )}
      {activeUser && (
        <NewWorkspaceModal
          isOpen={newWorkspaceModalOpen}
          setIsOpen={setNewWorkspaceModalOpen}
          activeUser={activeUser}
        />
      )}
      <div className="bg-wet-concrete text-sm text-center py-2 block md:hidden">
        <p>Mobile experience is currently read-only.</p>
        <p>Use on desktop to create proposals and RFPs.</p>
      </div>
      <div className="w-full border-b border-concrete h-[70px] px-6 flex items-center justify-between">
        <div className={`cursor-pointer ${activeUser ? "hidden" : "block"} md:block`}>
          <Link href={Routes.Home({})}>
            <Image src={StationLogo} alt="Station logo" height={30} width={80} />
          </Link>
        </div>
        <div
          className={` ${
            activeUser ? "block" : "hidden"
          } hover:bg-wet-concrete hover:rounded p-1 md:hidden`}
        >
          <MenuAlt4Icon height={25} width={25} onClick={() => setIsMobileSidebarOpen(true)} />
        </div>
        <div className="flex flex-row items-center space-x-4">
          <Button
            type={ButtonType.Secondary}
            onClick={() => router.push(Routes.ProposalTypeSelection())}
            className="hidden md:inline"
          >
            Create
          </Button>
          <Listbox
            error={isChainSupported === false ? { message: "Switch network" } : undefined}
            defaultValue={connectedChain}
            items={SUPPORTED_CHAINS}
            onChange={(item) => {
              switchNetwork?.(item.id)
              const activeChain = SUPPORTED_CHAINS.find((chain) => chain.id === item.id)
              setActiveChain?.(activeChain)
              return true
            }}
            className="hidden md:relative"
          />
          {!address ? (
            <Button onClick={() => toggleWalletModal(true)}>Connect wallet</Button>
          ) : !activeUser || activeUser?.address !== address ? (
            <Button overrideWidthClassName="w-[162px]" onClick={() => toggleWalletModal(true)}>
              Sign in
            </Button>
          ) : (
            <Dropdown
              className="h-[35px]"
              button={
                <div className="px-2 h-[35px] inline-flex w-full justify-center items-center rounded-md text-sm">
                  <span className="flex flex-row space-x-2 items-center">
                    <Avatar
                      size={Sizes.SM}
                      pfpUrl={activeUser?.data.pfpUrl}
                      address={activeUser?.address}
                    />
                    <span className="block text-marble-white text-sm mr-12">
                      @{ensName || truncateString(activeUser?.address || "")}
                    </span>
                    <DropdownChevronIcon />
                  </span>
                </div>
              }
              items={[
                { name: "Create group workspace", onClick: () => setNewWorkspaceModalOpen(true) },
                { name: "Disconnect", onClick: () => handleDisconnect() },
              ]}
            />
          )}
          <Dropdown
            button={
              <DotsHorizontalIcon className="hidden sm:inline-block h-4 w-4 fill-marble-white hover:cursor-pointer hover:fill-concrete" />
            }
            items={[
              { name: "Product manual", href: LINKS.PRODUCT_MANUAL },
              { name: "Help desk", href: LINKS.HELP_DESK },
              { name: "Newstand", href: LINKS.NEWSTAND },
              { name: "Legal & Privacy", href: LINKS.LEGAL },
            ]}
          />
        </div>
      </div>
      <span className="hidden md:block">
        <NavigationSidebar toggleMobileSidebar={setIsMobileSidebarOpen} />
      </span>
      <div className="h-full md:h-[calc(100vh-70px)] md:ml-[70px] relative overflow-y-scroll">
        {children}
      </div>
    </>
  )
}

export default Navigation
