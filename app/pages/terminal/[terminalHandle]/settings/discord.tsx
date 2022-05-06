import { useState, useEffect, useMemo } from "react"
import { BlitzPage, useParam, useQuery, useMutation } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import UpsertTags from "app/tag/mutations/upsertTags"
import Navigation from "app/terminal/components/settings/navigation"
import Checkbox from "app/core/components/form/Checkbox"
import useToast from "app/core/hooks/useToast"
import { Field, Form } from "react-final-form"

type Guild = {
  roles: Role[]
}

type Role = {
  name: string
  id: string
}

const DiscordSettingsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false }
  )
  const [addToast, Toast] = useToast()
  const [connectedGuild, setConnectedGuild] = useState<Guild | undefined>(undefined)
  const [upsertTags] = useMutation(UpsertTags, {
    onSuccess: () => {
      addToast("Your roles have been updated.")
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

  // kind of confusing to explain, you probably need to see it to understand so I recorded a loom
  // https://www.loom.com/share/f5c67a2872854bb386330ddbb744a5d8
  // When the form successfully saves, it calls the toast component to show the user a success notification.
  // The toast is set on a 3 second timeout, so it automatically closes after 3 seconds.
  // The problem though, is that once the toast closes, that triggers a change in state, which triggers another fetch
  // of the terminal and the old tags. This means that if you were to change the form state in the time between saving
  // and the three seconds before the toast closes, it would reset back to the state at the time of the save.
  // This is likely a small edge case, but its bothering me.
  // to get around it, we memoize the initial form state. This way, the form does not re-render its state when the
  // toast closes. There is also no lag after the save. WOW! And people thought useMemo was over-engineering...
  // not today!!
  const _initialFormValues = useMemo(() => {
    if (connectedGuild && terminal) {
      let allRoles = connectedGuild.roles.reduce((acc, role) => {
        acc[role.name] = {
          active: true,
          type: "inactive",
        }
        return acc
      }, {})

      let existingRoles = terminal?.tags.reduce((acc, tag) => {
        acc[tag.value] = {
          type: tag.type,
          active: tag.active,
        }
        return acc
      }, {})

      return Object.assign(allRoles, existingRoles)
    } else {
      return {}
    }
  }, [connectedGuild, terminal])

  return (
    <Navigation>
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
            href={`https://discord.com/api/oauth2/authorize?guild_id=${terminal?.data.guildId}&client_id=${process.env.DISCORD_CLIENT_ID}&permissions=268435456&scope=bot`}
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
          initialValues={_initialFormValues}
          onSubmit={async (values) => {
            let names = Object.keys(values)
            let tags = names.map((name) => {
              return {
                value: name,
                active: values[name].active,
                type: values[name].type,
                discordId: values[name].discordId,
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
                    <h2 className="text-marble-white text-2xl font-bold">Discord</h2>
                    <button className="rounded text-tunnel-black bg-magic-mint px-8" type="submit">
                      Save
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col pb-2 col-span-2">
                        <h3 className="font-bold">Manage Roles*</h3>
                        <span className="text-concrete text-xs mt-1">
                          Sort roles into categories
                        </span>
                        <div className="grid grid-cols-2 mt-6 gap-y-2">
                          {connectedGuild.roles.map((role, idx) => {
                            let cbState = form.getFieldState(role.name + ".active")
                            return (
                              <>
                                <div key={idx} className="flex flex-row items-center">
                                  <Checkbox name={`${role.name}.active`} checked={cbState?.value} />
                                  <p className="text-bold text-xs uppercase tracking-wider rounded-full px-2 py-0.5 bg-wet-concrete inline ml-2">
                                    {role.name}
                                  </p>
                                </div>
                                <div>
                                  <Field name={`${role.name}.type`}>
                                    {({ input }) => (
                                      <div>
                                        <select
                                          {...input}
                                          className={`bg-tunnel-black w-[200px] ${
                                            !cbState?.value
                                              ? "text-wet-concrete"
                                              : "text-marble-white"
                                          }`}
                                          required={cbState?.value}
                                        >
                                          {cbState?.value ? (
                                            <>
                                              <option value="">Choose option</option>
                                              <option value="role">Role</option>
                                              <option value="initiative">Initiative</option>
                                              <option value="status">Status</option>
                                              <option value="guild">Guild</option>
                                            </>
                                          ) : (
                                            <option value="">inactive</option>
                                          )}
                                        </select>
                                      </div>
                                    )}
                                  </Field>
                                  <Field name={`${role.name}.discordId`}>
                                    {({ input }) => (
                                      <input {...input} type="hidden" value={role.id} />
                                    )}
                                  </Field>
                                </div>
                              </>
                            )
                          })}
                        </div>
                      </div>
                      <Toast />
                    </div>
                  </div>
                </div>
              </form>
            )
          }}
        />
      )}
    </Navigation>
  )
}

DiscordSettingsPage.suppressFirstRenderFlicker = true

export default DiscordSettingsPage
