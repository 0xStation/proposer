import {
  BlitzPage,
  useParam,
  Link,
  Image,
  Routes,
  useRouter,
  GetServerSideProps,
  getSession,
  invoke,
} from "blitz"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Navigation from "app/terminal/components/settings/navigation"
import Back from "/public/back-icon.svg"
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

const NewCheckbookSettingsPage: BlitzPage = () => {
  const router = useRouter()

  const terminalHandle = useParam("terminalHandle") as string

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <div className="px-6 py-8">
          <div className="flex flex-row space-x-4">
            <Link href={Routes.CheckbookSettingsPage({ terminalHandle })}>
              <Image
                src={Back}
                alt="Close button"
                width={16}
                height={16}
                className="cursor-pointer"
              />
            </Link>
            <h1 className="text-2xl font-bold">New Checkbook</h1>
          </div>
          <div className="w-1/2">
            <CheckbookForm
              isEdit={true}
              callback={() =>
                router.push(Routes.CheckbookSettingsPage({ terminalHandle, creationSuccess: true }))
              }
            />
          </div>
        </div>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

export default NewCheckbookSettingsPage
