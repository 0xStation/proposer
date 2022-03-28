import { useMemo, useState } from "react"
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
  const [accountCreationLoading, setAccountCreationLoading] = useState<boolean>(false)

  if (!address) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <h1 className="text-marble-white text-3xl text-center">
          Connect your wallet to create an account.
        </h1>
      </div>
    )
  }

  // show a loading state after a new profile is created,
  // otherwise, `activeUser` will be set and notify the user they alreayd have an account
  // before we redirect to the user's profile page on account creation.
  if (accountCreationLoading) {
    return (
      <div className="min-h-screen text-center grid place-content-center text-marble-white">
        ...Loading
      </div>
    )
  }

  if (activeUser && !accountCreationLoading) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <h1 className="text-marble-white text-3xl text-center">Your already have a profile!</h1>
        <p className="text-marble-white text-center mt-2">
          Do you want to{" "}
          <a href={"/profile/edit"} className="text-magic-mint hover:underline">
            edit
          </a>{" "}
          your profile instead?
        </p>
      </div>
    )
  }

  return (
    <div className="bg-tunnel-black min-h-[calc(100vh-15rem)] h-[1px] relative">
      <h1 className="text-marble-white text-4xl text-center pt-12 mb-4">Complete your profile</h1>
      <div className="mx-auto max-w-2xl">
        <AccountForm
          onSuccess={() => {
            setAccountCreationLoading(true)
            router.push(`/profile/${activeUser?.address}`)
          }}
          address={address}
          isEdit={false}
        />
      </div>
    </div>
  )
}

CreateProfile.suppressFirstRenderFlicker = true
CreateProfile.getLayout = (page) => <Layout title="Create Profile">{page}</Layout>

export default CreateProfile
