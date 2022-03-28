import { useState, useEffect } from "react"
import { BlitzPage, useRouter, useRouterQuery, useParam, useQuery } from "blitz"
import { Tag } from "app/core/components/Tag"
import TerminalCard from "app/terminal/components/TerminalCard"
import ApplicationCard from "app/application/components/ApplicationCard"
import ApplicationDrawer from "app/application/components/ApplicationDrawer"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import { getWalletString } from "app/utils/getWalletString"
import Button from "app/core/components/Button"
import ExploreModal from "app/core/components/Explore/ExploreModal"
import { QUERY_PARAMETERS, PROFILE_TABS } from "app/core/utils/constants"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

type ProfileTabs = "TERMINALS" | "INITIATIVES"

// the profile homepage
// can see a users initiatives + termials + profile info at a glance
const ProfileHome: BlitzPage = () => {
  const accountAddress = useParam("accountAddress", "string") as string
  const { setTab } = useRouterQuery()
  const [isExploreModalOpen, setIsExploreModalOpen] = useState<boolean>(false)
  const [sliderOpen, setSliderOpen] = useState(false)
  const [activeApplication, setActiveApplication] = useState()
  const [subpage, setSubpage] = useState<ProfileTabs>(PROFILE_TABS.TERMINALS as ProfileTabs)
  const activeUser = useStore((state) => state.activeUser)
  const router = useRouter()
  const { DIRECTED_FROM, SET_TAB } = QUERY_PARAMETERS

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    { enabled: !!accountAddress, suspense: false }
  )

  useEffect(() => {
    if (setTab === SET_TAB.INITIATIVES) {
      setSubpage(PROFILE_TABS.INITIATIVES as ProfileTabs)
    } else if (setTab === SET_TAB.TERMINALS) {
      setSubpage(PROFILE_TABS.TERMINALS as ProfileTabs)
    }
  }, [setTab])

  const activeLinkStyles = "text-marble-white"
  const inactiveLinkStyles = "text-concrete hover:text-wet-concrete"

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
      <ExploreModal
        isExploreModalOpen={isExploreModalOpen}
        setIsExploreModalOpen={setIsExploreModalOpen}
      />
      <div className="w-full grid grid-cols-1 xl:grid-cols-4 min-h-[calc(100vh-88px)] h-[1px]">
        <ApplicationDrawer
          isOpen={sliderOpen}
          setIsOpen={setSliderOpen}
          application={activeApplication}
        />

        <div className="col-span-1 text-2xl md:border-r border-concrete h-full">
          <div className="h-[185px] relative mb-[116px]">
            {account?.data.coverURL ? (
              <img
                alt="The connected user's cover photo."
                src={account?.data.coverURL}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-gradient-to-b object-cover from-electric-violet to-magic-mint h-full w-full"></div>
            )}
            {account?.data.pfpURL ? (
              <img
                src={account?.data.pfpURL}
                alt="The connected user's profile picture."
                className="bg-gradient-to-b from-electric-violet to-magic-mint w-[200px] h-[200px] border border-marble-white rounded-full absolute bottom-[-100px] left-0 right-0 mx-auto"
              />
            ) : (
              <div className="bg-gradient-to-b from-electric-violet to-magic-mint w-[200px] h-[200px] border border-marble-white rounded-full absolute bottom-[-100px] left-0 right-0 mx-auto"></div>
            )}
          </div>
          <div className="px-8 ml-20 mr-10">
            <div className="flex flex-col">
              <h1 className="text-2xl text-marble-white">{account?.data.name}</h1>
              <span className="text-base text-concrete">
                {`@${getWalletString(account?.address)}`}
              </span>
            </div>
            <h3 className="text-marble-white text-base mt-4 font-normal">{account?.data.bio}</h3>
            {activeUser?.address === account?.address && (
              <button
                onClick={() => router.push("/profile/edit")}
                className="mt-4 p-[0.20rem] border border-marble-white text-marble-white text-base w-full rounded-md hover:bg-wet-concrete cursor-pointer"
              >
                Edit Profile
              </button>
            )}
            <div className="mt-8 space-y-8">
              {account?.data.contactURL ? (
                <div className="flex flex-col">
                  <h3 className="text-marble-white text-base font-bold">Contact</h3>
                  <span className="mt-1 text-base">
                    <a href={account?.data.contactURL} className="text-magic-mint">
                      {account?.data.contactURL}
                    </a>
                  </span>
                </div>
              ) : null}
              {account?.skills?.length ? (
                <div className="flex flex-col">
                  <h3 className="text-marble-white text-base font-bold">Skills</h3>
                  <div className="mt-1 flex flex-row flex-wrap">
                    {account?.skills?.map((account_skill, index) => {
                      return (
                        <Tag key={index} type="skill">
                          {account_skill.skill.name}
                        </Tag>
                      )
                    })}
                  </div>
                </div>
              ) : null}
              {account?.data.timezone ? (
                <div className="flex flex-col">
                  <h3 className="text-marble-white text-base font-bold">Timezone</h3>
                  <span className="mt-1 text-marble-white text-base">{account?.data.timezone}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="col-span-2 xl:col-span-3 px-12 relative">
          <div className="mt-12">
            {((account?.tickets && account?.tickets.length > 0) ||
              (account?.initiatives && account?.initiatives.length > 0)) && (
              <>
                <div className="flex flex-row z-10">
                  <button
                    tabIndex={0}
                    onClick={() => setSubpage(PROFILE_TABS.TERMINALS as ProfileTabs)}
                    className={`${
                      subpage === "TERMINALS" ? activeLinkStyles : inactiveLinkStyles
                    } cursor-pointer text-2xl mr-12`}
                  >
                    Terminals
                  </button>
                  <button
                    tabIndex={0}
                    onClick={() => setSubpage(PROFILE_TABS.INITIATIVES as ProfileTabs)}
                    className={`${
                      subpage === "INITIATIVES" ? activeLinkStyles : inactiveLinkStyles
                    } cursor-pointer text-2xl mr-12`}
                  >
                    Initiatives
                  </button>
                </div>
                {subpage === PROFILE_TABS.TERMINALS && (
                  <div className="grid grid-cols-3 gap-y-3 gap-x-3 mt-12">
                    {account?.tickets &&
                      account?.tickets.map((ticket, index) => {
                        return <TerminalCard key={index} ticket={ticket} />
                      })}
                  </div>
                )}
                {subpage === PROFILE_TABS.INITIATIVES && (
                  <div className="grid grid-cols-3 gap-y-3 gap-x-3 mt-12">
                    {account?.initiatives &&
                      account?.initiatives.map((application, index) => {
                        return (
                          <ApplicationCard
                            address={account.address}
                            key={index}
                            application={application}
                            onClick={() => {
                              if (application.status === "APPLIED") {
                                setActiveApplication(application)
                                setSliderOpen(true)
                              } else if (application.status === "CONTRIBUTOR") {
                                router.push(
                                  `/terminal/${application.initiative.terminal.handle}/initiative/${application.initiative.localId}?directedFrom=${DIRECTED_FROM.PROFILE}`
                                )
                              }
                            }}
                          />
                        )
                      })}
                  </div>
                )}
              </>
            )}
            {/* Show if user is active in terminal but has no initiatives, or if the user is not in any terminals or initiatives */}
            {(!account?.initiatives?.length && subpage === PROFILE_TABS.INITIATIVES) ||
              (!account?.tickets?.length && subpage === PROFILE_TABS.TERMINALS && (
                <div className="w-full h-full flex items-center flex-col justify-center mt-[23%]">
                  <p className="text-marble-white text-2xl font-bold">Explore Terminals</p>
                  <p className="mt-2 text-marble-white text-base w-[400px] text-center">
                    Discover DAOs and communities, submit interests to initiatives, and start
                    contributing.
                  </p>
                  <Button
                    className="cursor-pointer mt-4 w-[300px] py-1"
                    onClick={() => setIsExploreModalOpen(true)}
                  >
                    Start exploring
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

ProfileHome.suppressFirstRenderFlicker = true

export default ProfileHome
