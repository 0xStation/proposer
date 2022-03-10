import { useMemo } from "react"
import { BlitzPage, useRouter } from "blitz"
import { useAccount } from "wagmi"
import AccountForm from "app/account/components/AccountForm"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"

const CreateProfile: BlitzPage = () => {
  const router = useRouter()
  const [{ data: accountData }] = useAccount({
    fetchEns: true,
  })
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const activeUser = useStore((state) => state.activeUser)

  if (!address) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <h1 className="text-marble-white text-3xl text-center">
          Connect your wallet to create an account.
        </h1>
      </div>
    )
  }

  if (activeUser) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <h1 className="text-marble-white text-3xl text-center">Your already have a profile!</h1>
        <p className="text-marble-white text-center mt-2">
          Do you want to{" "}
          <a href="/profile/edit" className="text-magic-mint hover:underline">
            edit
          </a>{" "}
          your profile instead?
        </p>
      </div>
    )
  }

  return (
    <div
      className="w-full h-full bg-cover bg-center bg-no-repeat border border-tunnel-black"
      style={{ backgroundImage: "url('/station-cover.png')" }}
    >
      <div className="bg-tunnel-black min-h-[calc(100vh-15rem)] h-[1px] mt-36 relative">
        <h1 className="text-marble-white text-3xl text-center pt-12 mb-4">Complete your profile</h1>
        <div className="mx-auto max-w-2xl pb-12">
          <AccountForm onSuccess={() => router.push("/profile")} address={address} isEdit={false} />
        </div>
      </div>
    </div>
  )
}

CreateProfile.suppressFirstRenderFlicker = true
CreateProfile.getLayout = (page) => <Layout title="Create Profile">{page}</Layout>

export default CreateProfile
