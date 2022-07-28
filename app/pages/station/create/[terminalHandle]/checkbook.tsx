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
import CheckAnimation from "public/check_animation.gif"
import TikTokIcon from "public/tiktok-icon.svg"

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
        className="absolute top-4 left-4 cursor-pointer"
        onClick={() => {
          router.push(Routes.BulletinPage({ terminalHandle, terminalCreated: true }))
        }}
      >
        <Image src={Exit} alt="Close button" width={16} height={16} />
      </div>
      <main className="text-marble-white min-h-screen max-w-screen-sm sm:mx-auto mb-5">
        <div className="w-[31rem]">
          <div className="flex flex-row pt-16">
            <div className="mr-1">
              <div className="w-60 h-1 bg-concrete" />
              <p className="text-concrete mt-2.5">Open a Station</p>
            </div>
            <div className="">
              <div className="w-60 h-1 bg-electric-violet" />
              <p className="text-electric-violet mt-2.5">Create a Checkbook</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-12">Create your first Checkbook</h1>
          <p className="mt-2">
            Checkbook allows you to create checks for proposers to cash after their proposals have
            been approved.{" "}
            <a
              className="text-electric-violet"
              href="https://station-labs.gitbook.io/station-product-manual/for-daos-communities/checkbook"
            >
              Learn more
            </a>
          </p>
          <Image src={CheckAnimation} alt="TikTok Icon." width={496} height={240} />

          <CheckbookForm
            isEdit={false}
            callback={(checkbookAddress?: string) => {
              if (checkbookAddress) {
                router.push(
                  Routes.BulletinPage({
                    terminalHandle,
                    terminalAndCheckbookCreated: checkbookAddress,
                  })
                )
              } else {
                router.push(Routes.BulletinPage({ terminalHandle, terminalCreated: true }))
              }
            }}
          />
        </div>
      </main>
    </Layout>
  )
}

export default NewCheckbookTerminalCreationPage
