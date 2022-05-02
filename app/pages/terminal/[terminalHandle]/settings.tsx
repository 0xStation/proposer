import { useState, useEffect } from "react"
import { BlitzPage, useParam, useQuery, useMutation } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import UpsertTags from "app/tag/mutations/upsertTags"
import Checkbox from "app/core/components/form/Checkbox"
import Toast from "app/core/components/Toast"
import { Field, Form } from "react-final-form"

type Guild = {
  roles: Role[]
}

type Role = {
  name: string
}

const SettingsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false }
  )
  const [successToastOpen, setSuccessToastOpen] = useState(false)
  const [connectedGuild, setConnectedGuild] = useState<Guild | undefined>(undefined)
  const [upsertTags] = useMutation(UpsertTags, {
    onSuccess: () => {
      setSuccessToastOpen(true)
      setTimeout(() => {
        setSuccessToastOpen(false)
      }, 3000)
    },
  })

  useEffect(() => {
    const fetchAsync = async () => {
      if (!terminal) return
      let selectedGuildId = terminal.data.guildId
      const response = await fetch("/api/discord/get-guild", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guild_id: selectedGuildId }),
      })

      if (response.status !== 200) {
        return
      }
      const guild = await response.json()
      setConnectedGuild(guild)
    }
    if (terminal) {
      fetchAsync()
    }
  }, [terminal])

  return (
    <main className="text-marble-white min-h-screen flex flex-row">
      <nav className="w-[70px]"></nav>
      <section className="w-[300px] border-r border-concrete p-6">
        <div className="fixed">
          <label className="font-bold text-sm text-marble-white uppercase tracking-wider">
            {terminalHandle}
          </label>
          <ul className="mt-6">
            <li className="text-concrete text-lg cursor-pointer">General Information</li>
          </ul>

          <label className="font-bold text-sm text-marble-white uppercase tracking-wider mt-8 block">
            Integrations
          </label>
          <ul className="mt-6">
            <li className="text-marble-white text-lg cursor-pointer">Discord</li>
          </ul>
        </div>
      </section>
      <section className="flex-1">
        {!connectedGuild && (
          <div className="w-full h-full flex items-center flex-col justify-center">
            <p className="text-marble-white text-2xl font-bold">Connect with Discord</p>
            <p className="mt-2 text-marble-white text-base w-[400px] text-center">
              Connect with Discord to synchronize roles and manage permissions & access on Station.
            </p>
            {/* the route for connecting to user */}
            {/* <a href="https://discord.com/api/oauth2/authorize?client_id=963465926353752104&redirect_uri=http%3A%2F%2Flocalhost%3A3000/discord&response_type=code&scope=identify%20guilds%20guilds.join%20guilds.members.read"> */}
            <a
              target="_blank"
              href="https://discord.com/api/oauth2/authorize?guild_id=${selectedGuild}&client_id=963465926353752104&permissions=268435456&scope=bot"
              rel="noreferrer"
            >
              <button className="cursor-pointer mt-8 w-[200px] py-1 bg-magic-mint text-tunnel-black rounded text-base">
                Connect
              </button>
            </a>
          </div>
        )}
        {connectedGuild && (
          <Form
            initialValues={
              terminal
                ? terminal?.tags.reduce((acc, tag) => {
                    acc[tag.value] = {
                      type: tag.type,
                      active: tag.active,
                    }
                    return acc
                  }, {})
                : {}
            }
            onSubmit={async (values) => {
              let names = Object.keys(values)
              let tags = names.map((name) => {
                return {
                  value: name,
                  active: values[name].active,
                  type: values[name].type,
                }
              })

              if (terminal) {
                await upsertTags({
                  tags,
                  terminalId: terminal.id,
                })
                refetch()
              }
            }}
            render={({ form, handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col">
                    <div className="p-6 border-b border-concrete flex justify-between">
                      <h2 className="text-marble-white text-2xl">Discord</h2>
                      <button
                        className="rounded text-tunnel-black bg-magic-mint px-8"
                        type="submit"
                      >
                        Save
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col pb-2 col-span-2">
                          <h3>Manage Roles*</h3>
                          <span className="text-concrete text-xs mt-1">
                            Sort roles into categories
                          </span>
                          <div className="grid grid-cols-2 mt-6 gap-y-2">
                            {connectedGuild.roles.map((role, idx) => {
                              let cbState = form.getFieldState(role.name + ".active")
                              return (
                                <>
                                  <div key={idx} className="flex flex-row items-center">
                                    <Checkbox
                                      name={`${role.name}.active`}
                                      checked={cbState?.value}
                                    />
                                    <p className="text-bold text-xs uppercase tracking-wider rounded-full px-2 py-0.5 bg-wet-concrete inline ml-2">
                                      {role.name}
                                    </p>
                                  </div>
                                  <div>
                                    <Field
                                      name={`${role.name}.type`}
                                      component="select"
                                      className={`bg-tunnel-black w-[200px] ${
                                        !cbState?.value ? "text-wet-concrete" : "text-marble-white"
                                      }`}
                                    >
                                      <option>Choose option</option>
                                      {cbState?.value && (
                                        <>
                                          <option value="role">Role</option>
                                          <option value="initiative">Initiative</option>
                                          <option value="status">Status</option>
                                        </>
                                      )}
                                    </Field>
                                  </div>
                                </>
                              )
                            })}
                          </div>
                        </div>
                        {successToastOpen && <Toast />}
                      </div>
                    </div>
                  </div>
                </form>
              )
            }}
          />
        )}
      </section>
    </main>
  )
}

SettingsPage.suppressFirstRenderFlicker = true

export default SettingsPage
