import { useState } from "react"
import { BlitzPage, useRouter } from "blitz"
import { Tag } from "app/core/components/Tag"
import TerminalCard from "app/terminal/components/TerminalCard"
import ApplicationCard from "app/application/components/ApplicationCard"
import ApplicationDrawer from "app/application/components/ApplicationDrawer"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import { getWalletString } from "app/utils/getWalletString"
import Button from "app/core/components/Button"
import ExploreModal from "app/core/components/Explore/ExploreModal"

// the profile homepage
// can see a users initiatives + termials + profile info at a glance
const ProfileHome: BlitzPage = () => {
  const [isExploreModalOpen, setIsExploreModalOpen] = useState<boolean>(false)
  const [sliderOpen, setSliderOpen] = useState(false)
  const [activeApplication, setActiveApplication] = useState()
  const [subpage, setSubpage] = useState<"TERMINALS" | "INITIATIVES">("TERMINALS")
  const activeUser = useStore((state) => state.activeUser)
  const router = useRouter()

  if (activeUser === null) {
    if (router.isReady) {
      router.push("/")
    } else {
      return <div></div>
    }
  }

  const activeLinkStyles = "text-marble-white"
  const inactiveLinkStyles = "text-concrete hover:text-wet-concrete"

  return (
    <>
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
            <img
              alt="The connected user's cover photo."
              src={activeUser?.data.coverURL}
              className="w-full h-full object-cover"
            />
            <img
              src={activeUser?.data.pfpURL}
              alt="The connected user's profile picture."
              className="w-[200px] h-[200px] border border-marble-white rounded-full absolute bottom-[-100px] left-0 right-0 mx-auto"
            />
          </div>
          <div className="px-8 ml-20 mr-10">
            <div className="flex flex-col">
              <h1 className="text-2xl text-marble-white">{activeUser?.data.name}</h1>
              <span className="text-base text-concrete">
                {getWalletString(activeUser?.address)}
              </span>
            </div>
            <h3 className="text-marble-white text-base mt-4 font-normal">{activeUser?.data.bio}</h3>
            <button
              onClick={() => router.push("/profile/edit")}
              className="mt-4 p-[0.20rem] border border-marble-white text-marble-white text-base w-full rounded-md hover:bg-wet-concrete cursor-pointer"
            >
              Edit Profile
            </button>
            <div className="mt-8 space-y-8">
              <div className="flex flex-col">
                <h3 className="text-marble-white text-base font-bold">Skills</h3>
                <div className="mt-1 flex flex-row flex-wrap">
                  {activeUser?.skills?.map((account_skill, index) => {
                    return (
                      <Tag key={index} type="skill">
                        {account_skill.skill.name}
                      </Tag>
                    )
                  })}
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-marble-white text-base font-bold">Timezone</h3>
                <span className="mt-1 text-marble-white text-base">
                  {activeUser?.data.timezone}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2 xl:col-span-3 px-12 relative">
          <div className="mt-12">
            {((activeUser?.tickets && activeUser?.tickets.length > 0) ||
              (activeUser?.initiatives && activeUser?.initiatives.length > 0)) && (
              <>
                <div className="flex flex-row z-10">
                  <button
                    tabIndex={0}
                    onClick={() => setSubpage("TERMINALS")}
                    className={`${
                      subpage === "TERMINALS" ? activeLinkStyles : inactiveLinkStyles
                    } cursor-pointer text-2xl mr-12`}
                  >
                    Terminals
                  </button>
                  <button
                    tabIndex={0}
                    onClick={() => setSubpage("INITIATIVES")}
                    className={`${
                      subpage === "INITIATIVES" ? activeLinkStyles : inactiveLinkStyles
                    } cursor-pointer text-2xl mr-12`}
                  >
                    Initiatives
                  </button>
                </div>
                {subpage === "TERMINALS" && (
                  <div className="grid grid-cols-3 gap-y-3 gap-x-3 mt-12">
                    {activeUser?.tickets &&
                      activeUser?.tickets.map((ticket, index) => {
                        return <TerminalCard key={index} ticket={ticket} />
                      })}
                  </div>
                )}
                {subpage === "INITIATIVES" && (
                  <div className="grid grid-cols-3 gap-y-3 gap-x-3 mt-12">
                    {activeUser?.initiatives &&
                      activeUser?.initiatives.map((application, index) => {
                        return (
                          <ApplicationCard
                            address={activeUser.address}
                            key={index}
                            application={application}
                            onClick={() => {
                              if (application.status === "APPLIED") {
                                setActiveApplication(application)
                                setSliderOpen(true)
                              } else if (application.status === "CONTRIBUTOR") {
                                router.push(
                                  `/terminal/${application.initiative.terminal.handle}/initiative/${application.initiative.localId}`
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
            {(!activeUser?.initiatives?.length && subpage === "INITIATIVES") ||
              (!activeUser?.tickets?.length && subpage === "TERMINALS" && (
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
    </>
  )
}

ProfileHome.suppressFirstRenderFlicker = true
ProfileHome.getLayout = (page) => <Layout title="My Station Profile">{page}</Layout>

export default ProfileHome
