import { BlitzPage, useQuery, useRouter, useSession } from "blitz"
import EditNavigation from "app/profile/components/settings/Navigation"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import useStore from "app/core/hooks/useStore"
import getAccountByAddress from "app/account/queries/getAccountByAddress"

const EditProfileApps: BlitzPage = () => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const session = useSession({ suspense: false })

  const [account, { isLoading }] = useQuery(
    getAccountByAddress,
    { address: activeUser?.address },
    { suspense: false }
  )

  if (isLoading) {
    // return loading
  }

  //   if (!session?.siwe?.address || !activeUser || !account) {
  //     return (
  //       <div className="mx-auto max-w-2xl py-12">
  //         <h1 className="text-marble-white text-3xl text-center">
  //           Please connect your wallet to edit your account.
  //         </h1>
  //       </div>
  //     )
  //   }

  return (
    <EditNavigation>
      <div className="p-6 border-b border-concrete flex justify-between">
        <h2 className="text-marble-white text-2xl font-bold">Apps</h2>
      </div>
      <div className="bg-tunnel-black relative">
        <div className="ml-6 max-w-lg pb-12 mt-6"></div>
      </div>
    </EditNavigation>
  )
}

EditProfileApps.suppressFirstRenderFlicker = true
EditProfileApps.getLayout = (page) => (
  <LayoutWithoutNavigation title="Edit Profile">{page}</LayoutWithoutNavigation>
)

export default EditProfileApps
