import { BlitzPage, useQuery } from "blitz"
import AccountForm from "app/account/components/AccountForm"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import { Account } from "app/account/types"
import getAccountByAddress from "app/account/queries/getAccountByAddress"

const EditProfile: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)

  const [account, { isLoading }] = useQuery(
    getAccountByAddress,
    { address: activeUser?.address },
    { suspense: false }
  )

  if (isLoading) {
    // return loading
  }

  if (!activeUser || !account) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <h1 className="text-marble-white text-3xl text-center">
          Please connect your wallet to edit your account.
        </h1>
      </div>
    )
  }

  return (
    <div
      className="w-full h-full bg-cover bg-center bg-no-repeat border border-tunnel-black"
      style={{ backgroundImage: "url('/station-cover.png')" }}
    >
      <div className="bg-tunnel-black min-h-[calc(100vh-15rem)] h-[1px] mt-36 relative">
        <h1 className="text-marble-white text-3xl text-center pt-12">Complete your profile</h1>
        <div className="mx-auto max-w-2xl pb-12">
          <AccountForm
            onSuccess={() => console.log("done")}
            address={activeUser.address}
            account={account}
            isEdit={true}
          />
        </div>
      </div>
    </div>
  )
}

EditProfile.suppressFirstRenderFlicker = true
EditProfile.getLayout = (page) => <Layout title="Edit Profile">{page}</Layout>

export default EditProfile
