import { useState } from "react"
import { BlitzPage, useMutation, useParam, useQuery, Routes, useRouter } from "blitz"
import { Field, Form } from "react-final-form"
import useDiscordGuild from "app/core/hooks/useDiscordGuild"
import useDiscordBotAuth from "app/core/hooks/useDiscordBotAuth"
import useActiveUserDiscordGuilds from "app/core/hooks/useActiveUserDiscordGuilds"
import updateTerminal from "app/terminal/mutations/updateTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"

const DiscordConnectPage: BlitzPage = () => {
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle }
  )
  const [selectedGuildId, setSelectedGuildId] = useState<string>()
  const { status: selectedGuildStatus, guild: selectedGuild } = useDiscordGuild(selectedGuildId)
  const { guilds } = useActiveUserDiscordGuilds()
  const { onOpen: onBotOpen, connected } = useDiscordBotAuth(selectedGuildId || "")

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
        <div className="border-t-4 border-neon-blue pt-2">
          <span className="text-sm text-neon-blue">Connect with Discord</span>
        </div>
        <div className="border-t-4 border-light-concrete pt-2">
          <span className="text-sm text-light-concrete">Import roles and members</span>
        </div>
      </div>

      <div className="mt-12">
        <h1 className="text-2xl font-bold">Connect with Discord</h1>
        <p>Add the Station bot to your discord to proceed.</p>
      </div>

      <Form
        initialValues={{}}
        onSubmit={async (values) => {
          await updateTerminalMutation({ id: terminal.id, ...values })
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
                      formState.dirty ? "bg-magic-mint" : "bg-concrete"
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
