import { BlitzPage, useQuery, useRouter, Image } from "blitz"
import AccountForm from "app/account/components/AccountForm"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import Exit from "public/exit-button.svg"

const EditProfile: BlitzPage = () => {
  const router = useRouter()
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
    <>
      <div className="bg-tunnel-black relative">
        <div className="absolute top-3 left-28">
          <div className="w-[24px] h-[24px]">
            <button
              className="text-marble-white"
              onClick={() => router.push(`/profile/${activeUser.address}`)}
            >
              <Image src={Exit} alt="Close button" width={24} height={24} />
            </button>
          </div>
        </div>
        <h1 className="text-marble-white text-4xl text-center pt-12">Edit your profile</h1>
        <div className="mx-auto max-w-2xl pb-12">
          <AccountForm
            onSuccess={() => router.push(`/profile/${activeUser.address}`)}
            address={activeUser.address}
            account={account}
            isEdit={true}
          />
        </div>
      </div>
    </>
  )
}

EditProfile.suppressFirstRenderFlicker = true
EditProfile.getLayout = (page) => <Layout title="Edit Profile">{page}</Layout>

export default EditProfile
