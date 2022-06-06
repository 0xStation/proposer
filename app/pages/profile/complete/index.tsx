import {
  BlitzPage,
  useRouter,
  Image,
  getSession,
  GetServerSideProps,
  invoke,
  InferGetServerSidePropsType,
} from "blitz"
import AccountForm from "app/account/components/AccountForm"
import Layout from "app/core/layouts/LayoutWithoutNavigation"
import Exit from "/public/exit-button.svg"
import getAccountByAddress from "app/account/queries/getAccountByAddress"

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

  const user = await invoke(getAccountByAddress, { address: session?.siwe?.address })

  return {
    props: {
      siweAddress: session?.siwe?.address,
      activeUser: user,
    }, // will be passed to the page component as props
  }
}

const CreateProfile: BlitzPage = ({
  siweAddress,
  activeUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()

  const handleCloseButtonClick = () => {
    router.push(`/profile/${siweAddress}`)
  }

  return (
    <div>
      <div className="absolute top-5 left-5">
        <button onClick={handleCloseButtonClick}>
          <Image src={Exit} alt="Close button" width={16} height={16} />
        </button>
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
              router.push(`/profile/complete/discord`)
            }}
            address={siweAddress}
            isEdit={true}
            account={activeUser}
          />
        </div>
      </div>
    </div>
  )
}

CreateProfile.suppressFirstRenderFlicker = true
CreateProfile.getLayout = (page) => <Layout title="Create Profile">{page}</Layout>

export default CreateProfile
