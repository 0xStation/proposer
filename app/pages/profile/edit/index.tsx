import {
  BlitzPage,
  useRouter,
  getSession,
  GetServerSideProps,
  Routes,
  invoke,
  InferGetServerSidePropsType,
} from "blitz"
import AccountForm from "app/account/components/AccountForm"
import EditNavigation from "app/profile/components/settings/Navigation"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import getAccountByAddress from "app/account/queries/getAccountByAddress"

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res)

  const user = await invoke(getAccountByAddress, { address: session?.siwe?.address })

  if (!session?.siwe?.address) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  if (!user) {
    return {
      redirect: {
        destination: Routes.CreateProfile(),
        permanent: false,
      },
    }
  }

  return {
    props: {
      activeUser: user,
    }, // will be passed to the page component as props
  }
}

const EditProfile: BlitzPage = ({
  activeUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  return (
    <EditNavigation activeUser={activeUser}>
      <div className="p-6 border-b border-concrete flex justify-between">
        <h2 className="text-marble-white text-2xl font-bold">Overview</h2>
      </div>
      <div className="bg-tunnel-black relative">
        <div className="ml-6 max-w-lg pb-12 mt-6">
          <AccountForm
            onSuccess={() => router.push(`/profile/${activeUser.address}`)}
            address={activeUser.address}
            account={activeUser}
            isEdit={true}
          />
        </div>
      </div>
    </EditNavigation>
  )
}

EditProfile.suppressFirstRenderFlicker = true
EditProfile.getLayout = (page) => (
  <LayoutWithoutNavigation title="Edit Profile">{page}</LayoutWithoutNavigation>
)

export default EditProfile
