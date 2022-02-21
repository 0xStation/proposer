import { useMemo } from "react"
import { BlitzPage } from "blitz"
import { useAccount } from "wagmi"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import { Account } from "app/account/types"
import { getWalletString } from "app/utils/getWalletString"

// the profile homepage
// can see a users initiatives + termials + profile info at a glance
const ProfileHome: BlitzPage = () => {
  const [{ data: accountData }] = useAccount({
    fetchEns: true,
  })
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const activeUser: Account | null = useStore((state) => state.activeUser)

  // todo: return something better
  if (!activeUser) {
    return <></>
  }

  return (
    <div
      className="w-full h-full bg-cover bg-center bg-no-repeat border"
      style={{ backgroundImage: "url('/station-cover.png')" }}
    >
      <div className="bg-tunnel-black min-h-[calc(100vh-15rem)] h-[1px] mt-36 relative">
        <div className="grid gap-0 grid-cols-1 md:grid-cols-3 xl:grid-cols-4 max-w-screen-xl h-full mx-auto">
          <div className="col-span-1 pl-4 text-2xl border-concrete border-b pb-12 md:border-b-0 md:border-r md:pr-6 h-full">
            <div className="border-b border-concrete pb-4">
              <div className="flex items-center mt-12">
                <div className="flex-2/5 mr-4">
                  <img
                    src={activeUser.data.pfpURL}
                    alt="PFP"
                    className="h-[52px] w-[52px] border border-marble-white rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl text-marble-white">{activeUser.data.name}</h1>
                  <span className="text-base text-concrete">
                    {getWalletString(activeUser.address)}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex flex-col">
                  <h3 className="text-marble-white text-base font-bold">Skills</h3>
                  {/* {activeUser.skills.map((skill) => {
                    return <div className="text-marble-white">{skill.name}</div>
                  })} */}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-marble-white text-base font-bold">Timezone</h3>
                  <span className="text-marble-white text-base">{activeUser.data.timezone}</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-marble-white text-base font-bold">Contact</h3>
                  <span className="text-marble-white text-base">{activeUser.data.discordId}</span>
                </div>
                <button className="border border-marble-white text-marble-white text-base w-full rounded-md hover:text-tunnel-black hover:bg-marble-white">
                  Edit Profile
                </button>
              </div>
            </div>
            <ul className="mt-4 text-lg">
              <li className={`cursor-pointer hover:text-marble-white text-marble-white font-bold`}>
                Terminals
              </li>
              <li className={`cursor-pointer hover:text-marble-white text-concrete font-bold`}>
                Initiatives
              </li>
            </ul>
          </div>
          <div className="col-span-2 xl:col-span-3 px-6 pb-12">
            <div className="mt-12">
              <div className="text-marble-white">stuff goes here</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

ProfileHome.suppressFirstRenderFlicker = true
ProfileHome.getLayout = (page) => <Layout title="My Station Profile">{page}</Layout>

export default ProfileHome
