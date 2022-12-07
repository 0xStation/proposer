import React, { useMemo } from "react"
import useStore from "../hooks/useStore"
import { AccountAccountType } from "@prisma/client"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import ExploreImageIcon from "public/explore.svg"
import Image from "next/image"
import { genUrlFromRoute } from "app/utils/genUrlFromRoute"
import Link from "next/link"
import { gradientMap } from "../utils/constants"
import { useAccount } from "wagmi"
import { Account } from "app/account/types"

const ProfileIcon = ({
  activeUser,
  toggleMobileSidebar,
}: {
  activeUser: Account
  toggleMobileSidebar?
}) => {
  const router = useRouter()
  if (!activeUser) {
    return <></>
  }
  const profileSelected =
    (typeof window !== "undefined" &&
      router.pathname === Routes.WorkspaceHome({ accountAddress: activeUser.address }).pathname) ||
    router.pathname === Routes.WorkspaceSettings({ accountAddress: activeUser.address }).pathname ||
    router.pathname === Routes.WorkspaceRfps({ accountAddress: activeUser.address }).pathname

  return (
    <Link href={Routes.WorkspaceHome({ accountAddress: activeUser.address })}>
      <div className="relative flex items-center justify-center group">
        <span
          className={`${
            profileSelected ? "scale-100" : "scale-0 group-hover:scale-75"
          }  absolute w-[3px] h-[46px] min-w-max left-0 rounded-r-lg inline-block mr-2 mb-4
  bg-marble-white
  transition-all duration-200 origin-left`}
        />
        <button
          className={`${
            profileSelected ? "border-marble-white" : "border-wet-concrete"
          } bg-clip-border inline-block overflow-hidden cursor-pointer border group-hover:border-marble-white rounded-full h-[47px] mb-4`}
          onClick={() => {
            router.push(Routes.WorkspaceHome({ accountAddress: activeUser.address }))
            if (toggleMobileSidebar) {
              toggleMobileSidebar(false)
            }
          }}
        >
          <Image
            src={activeUser?.data?.pfpUrl || gradientMap[parseInt(activeUser.address, 16) % 6]}
            alt="Account profile picture. If no profile picture is set, there is a blue to green linear gradient."
            height={46}
            width={46}
          />
        </button>
      </div>
    </Link>
  )
}

const ExploreIcon = ({ toggleMobileSidebar }: { toggleMobileSidebar? }) => {
  const exploreSelected =
    typeof window !== "undefined" && window?.location?.pathname === Routes.Explore().pathname
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
        onClick={() => {
          router.push(Routes.Explore())
          if (toggleMobileSidebar) {
            toggleMobileSidebar(false)
          }
        }}
      >
        <Image src={ExploreImageIcon} alt="Explore icon" height={46} width={46} />
      </button>
    </div>
  )
}

export const NavigationSidebar = ({ toggleMobileSidebar }: { toggleMobileSidebar? }) => {
  const activeUser = useStore((state) => state.activeUser)
  const accountData = useAccount()
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  return (
    <div className="h-full w-[90px] md:h-[calc(100vh-70px)] md:w-[70px] bg-tunnel-black border-r border-concrete md:fixed md:top-[70px] left-0 text-center md:flex flex-col">
      <div className="h-full mt-4">
        <ExploreIcon toggleMobileSidebar={toggleMobileSidebar} />
        {/* if connected wallet changes from activeUser (from SIWE session), hide left nav options */}
        {activeUser && address === activeUser?.address && (
          <>
            <ProfileIcon activeUser={activeUser} toggleMobileSidebar={toggleMobileSidebar} />
            {activeUser?.originsOf
              ?.filter((aa) => aa.type === AccountAccountType.PIN_WORKSPACE)
              ?.map((aa, idx) => {
                return (
                  <ProfileIcon
                    activeUser={aa.targetAccount}
                    key={`profile-${idx}`}
                    toggleMobileSidebar={toggleMobileSidebar}
                  />
                )
              })}
          </>
        )}
      </div>
    </div>
  )
}
