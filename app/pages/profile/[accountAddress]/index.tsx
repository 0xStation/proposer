import { useState, useEffect } from "react"
import { BlitzPage, useRouter, useRouterQuery, useParam, useQuery } from "blitz"
import { Tag } from "app/core/components/Tag"
import TerminalCard from "app/terminal/TerminalCard"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import { getWalletString } from "app/utils/getWalletString"
import Button from "app/core/components/Button"
import { QUERY_PARAMETERS, PROFILE_TABS } from "app/core/utils/constants"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

type ProfileTabs = "TERMINALS"

// the profile homepage
// can see a users terminals + profile info at a glance
const ProfileHome: BlitzPage = () => {
  const accountAddress = useParam("accountAddress", "string") as string
  const { setTab } = useRouterQuery()
  const [subpage, setSubpage] = useState<ProfileTabs>(PROFILE_TABS.TERMINALS as ProfileTabs)
  const activeUser = useStore((state) => state.activeUser)
  const router = useRouter()
  const { SET_TAB } = QUERY_PARAMETERS

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    { enabled: !!accountAddress, suspense: false }
  )

  useEffect(() => {
    if (setTab === SET_TAB.TERMINALS) {
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
      <div className="w-full grid grid-cols-1 xl:grid-cols-4 min-h-[calc(100vh-88px)] h-[1px]">
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
            </div>
          </div>
        </div>
        <div className="col-span-2 xl:col-span-3 px-12 relative">
          <div className="mt-12">
            {account?.tickets && account?.tickets.length > 0 && (
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
                </div>
                {subpage === PROFILE_TABS.TERMINALS && (
                  <div className="flex mt-12 flex-wrap">
                    {account?.tickets &&
                      account?.tickets.map((ticket, index) => {
                        return <TerminalCard key={index} ticket={ticket} />
                      })}
                  </div>
                )}
              </>
            )}
            {/* Show if the user is not in any terminals */}
            {!account?.tickets?.length && subpage === PROFILE_TABS.TERMINALS && (
              <div className="w-full h-full flex items-center flex-col justify-center mt-[23%]">
                {activeUser?.address === account?.address ? (
                  <>
                    <p className="text-marble-white text-2xl font-bold">Explore Terminals</p>
                    <p className="mt-2 text-marble-white text-base w-[400px] text-center">
                      Discover DAOs and communities and start contributing.
                    </p>
                    <Button className="cursor-pointer mt-4 w-[300px] py-1">Start exploring</Button>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-2xl text-center">
                      {`${account?.data?.name}`} is still exploring
                    </p>
                    <p className="font-bold text-2xl text-center w-[290px]">in Station</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

ProfileHome.suppressFirstRenderFlicker = true

export default ProfileHome
