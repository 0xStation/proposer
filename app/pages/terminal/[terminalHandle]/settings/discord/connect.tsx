import { useState } from "react"
import {
  BlitzPage,
  useMutation,
  useParam,
  useQuery,
  Routes,
  useRouter,
  GetServerSideProps,
  getSession,
  invoke,
} from "blitz"
import { Field, Form } from "react-final-form"
import useDiscordGuild from "app/core/hooks/useDiscordGuild"
import useDiscordBotAuth from "app/core/hooks/useDiscordBotAuth"
import useActiveUserDiscordGuilds from "app/core/hooks/useActiveUserDiscordGuilds"
import updateTerminal from "app/terminal/mutations/updateTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"

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

const DiscordConnectPage: BlitzPage = () => {
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle }
  )
  const [selectedGuildId, setSelectedGuildId] = useState<string>()
  const { status: selectedGuildStatus } = useDiscordGuild(selectedGuildId)
  const { guilds } = useActiveUserDiscordGuilds()
  const { onOpen: onBotOpen } = useDiscordBotAuth(selectedGuildId || "")

  const [updateTerminalMutation] = useMutation(updateTerminal, {
    onSuccess: (_data) => {
      router.push(Routes.DiscordImportPage({ terminalHandle: terminalHandle }))
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  // wonder if we could use error boundaries for things like this
  if (!terminal) {
    return <></>
  }

  return (
    <div className="max-w-screen-sm mx-auto pt-12 flex flex-col">
      <div className="grid grid-cols-2 gap-2">
        <div className="border-t-4 border-electric-violet pt-2">
          <span className="text-sm text-electric-violet">Connect with Discord</span>
        </div>
        <div className="border-t-4 border-light-concrete pt-2">
          <span className="text-sm text-light-concrete">Import roles and members</span>
        </div>
      </div>

      <div className="mt-12">
        <h1 className="text-2xl font-bold">Connect with Discord</h1>
        <p>Connect with Discord to import and create your membership directory in a few clicks.</p>
      </div>

      <Form
        initialValues={{}}
        onSubmit={async (values) => {
          //@ts-ignore
          await updateTerminalMutation({
            id: terminal.id,
            ...values,
          })
          refetch()
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          setSelectedGuildId(formState.values.guildId)
          return (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col mt-12">
                <h3 className="font-bold">Select a server*</h3>
                <span className="text-concrete text-xs mb-2 block">
                  In order to integrate fully with Discord, your terminal needs to connect the
                  Station bot to your Discord server.
                </span>
                <div className="custom-select-wrapper">
                  <Field name="guildId">
                    {({ input }) => (
                      <select {...input} className="w-full p-2 bg-wet-concrete border rounded">
                        <option>Select one</option>
                        {guilds.map((guild, idx) => {
                          return (
                            <option value={guild.value} key={idx}>
                              {guild.label}
                            </option>
                          )
                        })}
                      </select>
                    )}
                  </Field>
                </div>
                <h3 className="font-bold mt-12 mb-2">Invite Station Bot*</h3>

                {/* likely means the auth didn't go through, the guild is not connected yet */}
                {selectedGuildStatus !== "ready" ? (
                  <div>
                    <button
                      type="button"
                      className="border border-marble-white w-full rounded py-2"
                      onClick={() => onBotOpen()}
                    >
                      Connect Station bot
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      className="border border-marble-white w-full rounded py-2 cursor-default"
                    >
                      Connected
                    </button>
                  </div>
                )}

                <div>
                  <button
                    className={`rounded text-tunnel-black px-8 mt-12 py-2 ${
                      formState.dirty ? "bg-electric-violet" : "bg-concrete"
                    }`}
                    type="submit"
                  >
                    Next
                  </button>
                </div>
              </div>
            </form>
          )
        }}
      />
    </div>
  )
}

export default DiscordConnectPage
