import { BlitzPage, useRouter, useSession, Image } from "blitz"
import AccountForm from "app/account/components/AccountForm"
import Layout from "app/core/layouts/LayoutWithoutNavigation"
import Exit from "/public/exit-button.svg"

const CreateProfile: BlitzPage = () => {
  const router = useRouter()
  const session = useSession({ suspense: false })

  if (!session?.siwe?.address) {
    return <div>You need to connect your wallet first!</div>
  }

  return (
    <div>
      <div className="absolute top-5 left-5">
        <a href="https://station.express">
          <Image src={Exit} alt="Close button" width={16} height={16} />
        </a>
      </div>
      <div className="bg-tunnel-black relative mx-auto w-[31rem]">
        <div className="flex flex-row mt-16">
          <div className="mr-1">
            <div className="w-60 h-1 bg-electric-violet" />
            <p className="text-electric-violet mt-2.5">Tell us about yourself</p>
          </div>
          <div className="">
            <div className="w-60 h-1 bg-concrete" />
            <p className="text-concrete mt-2.5">Connect with Discord</p>
          </div>
        </div>
        <h1 className="text-marble-white text-2xl font-bold pt-12 mb-12">Complete a Profile</h1>
        <div className="mx-auto max-w-2xl pb-10">
          <AccountForm
            onSuccess={() => {
              router.push(`/profile/${session?.siwe?.address}`)
            }}
            address={session?.siwe?.address}
            isEdit={false}
          />
        </div>
      </div>
    </div>
  )
}

CreateProfile.suppressFirstRenderFlicker = true
CreateProfile.getLayout = (page) => <Layout title="Create Profile">{page}</Layout>

export default CreateProfile
