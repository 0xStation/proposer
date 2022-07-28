import {
  BlitzPage,
  useMutation,
  useParam,
  useQuery,
  Link,
  Image,
  Routes,
  useRouter,
  GetServerSideProps,
  getSession,
  invoke,
} from "blitz"
import { Field, Form } from "react-final-form"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import createTokenTag from "app/tag/mutations/createTokenTag"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Navigation from "app/terminal/components/settings/navigation"
import useStore from "app/core/hooks/useStore"
import Back from "/public/back-icon.svg"
import networks from "app/utils/networks.json"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  try {
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
  } catch (err) {
    console.error("Failed to check permissions", err)
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

const NewTokenSettingsPage: BlitzPage = () => {
  const router = useRouter()
  const [createTokenTagMutation] = useMutation(createTokenTag)

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const setToastState = useStore((state) => state.setToastState)

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <div className="px-6 py-8">
          <div className="flex flex-row space-x-4">
            <Link href={Routes.TokenSettingsPage({ terminalHandle })}>
              <Image
                src={Back}
                alt="Close button"
                width={16}
                height={16}
                className="cursor-pointer"
              />
            </Link>
            <h1 className="text-2xl font-bold">New token</h1>
          </div>
          <Form
            initialValues={{}}
            onSubmit={async (values) => {
              if (terminal) {
                try {
                  const metadataResponse = await fetch("/api/fetch-token-metadata", {
                    method: "POST",
                    headers: {
                      Accept: "application/json, text/plain, */*",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      address: values.address,
                      chainId: parseInt(values.chainId) || 1,
                    }),
                  })

                  const metadata = await metadataResponse.json()

                  if (metadata.response !== "success") {
                    setToastState({
                      isToastShowing: true,
                      type: "error",
                      message: metadata.message,
                    })

                    return
                  }

                  try {
                    await createTokenTagMutation({
                      terminalId: terminal.id,
                      name: metadata.data.name,
                      type: metadata.data.type,
                      symbol: metadata.data.symbol,
                      address: values.address,
                      chainId: parseInt(values.chainId) || 1,
                    })

                    router.push(Routes.TokenSettingsPage({ terminalHandle }))
                  } catch (e) {
                    console.error(e)
                    setToastState({
                      isToastShowing: true,
                      type: "error",
                      message: "Token already exists.",
                    })
                  }
                } catch (e) {
                  console.error(e)
                }
              }
            }}
            render={({ form, handleSubmit }) => {
              const formState = form.getState()
              return (
                <form onSubmit={handleSubmit} className="mt-12">
                  <div className="flex flex-col w-1/2">
                    <h3 className="font-bold">Chain*</h3>
                    <Field
                      name="chainId"
                      component="select"
                      className="bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                    >
                      {Object.keys(networks).map((chainId, idx) => {
                        return (
                          <option value={chainId} key={idx}>
                            {networks[chainId].name}
                          </option>
                        )
                      })}
                    </Field>
                    <h3 className="font-bold mt-4">Contract address*</h3>
                    <Field
                      name="address"
                      component="input"
                      type="text"
                      placeholder="0x..."
                      className="bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                    />
                    <div>
                      <button
                        className={`rounded text-tunnel-black px-8 py-2 h-full mt-12 bg-electric-violet ${
                          formState.dirty ? "opacity-100" : "opacity-70"
                        }`}
                        type="submit"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              )
            }}
          />
        </div>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

export default NewTokenSettingsPage
