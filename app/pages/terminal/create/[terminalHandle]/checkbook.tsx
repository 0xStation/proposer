import {
  BlitzPage,
  useParam,
  Routes,
  useRouter,
  GetServerSideProps,
  getSession,
  invoke,
  Image,
} from "blitz"
import Exit from "/public/exit-button.svg"
import Layout from "app/core/layouts/Layout"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"
import CheckbookForm from "app/checkbook/components/CheckbookForm"

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  const session = await getSession(req, res)

  if (!session?.userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  const terminal = await invoke(getTerminalByHandle, { handle: params?.terminalHandle as string })

  const hasTagAdminPermissions = await invoke(hasAdminPermissionsBasedOnTags, {
    terminalId: terminal?.id as number,
    accountId: session?.userId as number,
  })

  if (
    !terminal?.data?.permissions?.accountWhitelist?.includes(session?.siwe?.address as string) &&
    !hasTagAdminPermissions
  ) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
}

const NewCheckbookTerminalCreationPage: BlitzPage = () => {
  const router = useRouter()

  const terminalHandle = useParam("terminalHandle") as string

  return (
    <Layout>
      <div
        className="absolute top-0 left-2 cursor-pointer"
        onClick={() => {
          router.back()
        }}
      >
        <Image src={Exit} alt="Close button" width={12} height={12} />
      </div>
      <main className="text-marble-white min-h-screen max-w-screen-sm sm:mx-auto mb-5">
        <div className="w-[31rem]">
          <div className="flex flex-row mt-16">
            <div className="mr-1">
              <div className="w-60 h-1 bg-concrete" />
              <p className="text-concrete mt-2.5">Open a Terminal</p>
            </div>
            <div className="">
              <div className="w-60 h-1 bg-electric-violet" />
              <p className="text-electric-violet mt-2.5">Create a Checkbook</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-12">Create your first Checkbook</h1>
          <p className="mt-2">
            Checkbook allows you to create checks for proposers to cash after their proposals have
            been approved. <a className="text-electric-violet">Learn more</a>
          </p>
          <div className="mt-9 bg-wet-concrete text-torch-red h-[219px] w-[479px] pt-[90px] pl-[175px]">
            TO BE REPLACED
          </div>
          <CheckbookForm
            callback={() =>
              router.push(Routes.CheckbookSettingsPage({ terminalHandle, creationSuccess: true }))
            }
          />
        </div>
      </main>
    </Layout>
  )
}

export default NewCheckbookTerminalCreationPage
