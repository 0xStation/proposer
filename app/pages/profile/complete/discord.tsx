import {
  BlitzPage,
  useRouter,
  Image,
  invoke,
  GetServerSideProps,
  getSession,
  InferGetServerSidePropsType,
  Link,
  Routes,
} from "blitz"
import Layout from "app/core/layouts/LayoutWithoutNavigation"
import Exit from "/public/exit-button.svg"
import DiscordIcon from "public/discord-icon.svg"
import useDiscordAuthWithCallback from "app/core/hooks/useDiscordAuthWithCallback"
import addDiscordIdAndMergeAccount from "app/account/mutations/addDiscordIdAndMergeAccount"
import useStore from "app/core/hooks/useStore"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import useLocalStorage from "app/core/hooks/useLocalStorage"
import { Auth } from "app/auth/types"

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res)

  if (!session?.siwe?.address) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  const activeUser = await invoke(getAccountByAddress, { address: session?.siwe?.address })

  return {
    props: {
      activeUser,
    }, // will be passed to the page component as props
  }
}

const CreateConnectDiscord: BlitzPage = ({
  activeUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const setToastState = useStore((state) => state.setToastState)
  const [discordAuthToken] = useLocalStorage<Auth | undefined>(
    "dc_auth_identify guilds",
    undefined,
    false
  )
  const router = useRouter()

  const { callbackWithDCAuth, isAuthenticating, authorization } = useDiscordAuthWithCallback(
    "identify guilds",
    async (authorization) => {
      if (authorization) {
        try {
          let response = await fetch(`${process.env.BLITZ_PUBLIC_API_ENDPOINT}/users/@me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authorization}`,
              "Content-Type": "application/json",
            },
          })

          if (response.status !== 200) {
            throw Error(`Error: status not 200 - returned ${response.status}`)
          }

          const data = await response.json()

          const account = await invoke(addDiscordIdAndMergeAccount, {
            accountId: activeUser?.id,
            discordId: data?.id,
          })
          return account
        } catch (err) {
          console.error("Error connecting new account to Discord. Failed with err: ", err)
          setToastState({
            isToastShowing: true,
            type: "error",
            message:
              "Connection didn't fully go through. Please try again in your profile settings.",
          })
        }
      }
      return
    }
  )

  return (
    <div>
      <div className="absolute top-5 left-5 cursor-pointer">
        <Link href={Routes.ProfileHome({ accountAddress: activeUser?.address })}>
          <Image src={Exit} alt="Close button" width={16} height={16} />
        </Link>
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
        <button
          className={`cursor-pointer border border-marble-white w-full rounded mt-12 h-[35px]  ${
            discordAuthToken || authorization ? "opacity-70" : "hover:bg-wet-concrete"
          }`}
          onClick={callbackWithDCAuth}
          disabled={!!(discordAuthToken || authorization)}
        >
          <span className="mr-3 align-middle">
            <Image src={DiscordIcon} alt="Close button" width={15} height={15} />
          </span>
          {discordAuthToken || authorization ? "Connected" : "Connect with Discord"}
        </button>
        {(discordAuthToken || authorization) && (
          <button
            className="bg-electric-violet h-[35px] text-tunnel-black rounded px-10 mt-12"
            onClick={() => router.push(`/profile/${activeUser?.address}`)}
          >
            Finish
          </button>
        )}
        {!(discordAuthToken || authorization) && (
          <button
            className="border border-electric-violet h-[35px] text-electric-violet rounded px-10 mt-6 hover:bg-wet-concrete"
            onClick={() => router.push(`/profile/${activeUser?.address}`)}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}

CreateConnectDiscord.suppressFirstRenderFlicker = true
CreateConnectDiscord.getLayout = (page) => <Layout title="Create Profile">{page}</Layout>

export default CreateConnectDiscord
