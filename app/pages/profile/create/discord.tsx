import { BlitzPage, useRouter, useSession, Image } from "blitz"
import Layout from "app/core/layouts/LayoutWithoutNavigation"
import Exit from "/public/exit-button.svg"
import DiscordIcon from "public/discord-icon.svg"

const CreateConnectDiscord: BlitzPage = () => {
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
            <div className="w-60 h-1 bg-concrete" />
            <p className="text-concrete mt-2.5">Tell us about yourself</p>
          </div>
          <div className="">
            <div className="w-60 h-1 bg-electric-violet" />
            <p className="text-electric-violet mt-2.5">Connect with Discord</p>
          </div>
        </div>
        <h1 className="text-marble-white text-2xl font-bold pt-12 mb-4">Connect with Discord</h1>
        <p>
          Connecting your Station profile with Discord to showcase your membership in communities on
          Station.
        </p>
        <button className="border border-marble-white w-full rounded mt-12 py-2">
          <span className="mr-3 align-middle">
            <Image src={DiscordIcon} alt="Close button" width={15} height={15} />
          </span>
          Connect with Discord
        </button>
      </div>
    </div>
  )
}

CreateConnectDiscord.suppressFirstRenderFlicker = true
CreateConnectDiscord.getLayout = (page) => <Layout title="Create Profile">{page}</Layout>

export default CreateConnectDiscord
