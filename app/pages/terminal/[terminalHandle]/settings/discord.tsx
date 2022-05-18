import { useState, useMemo } from "react"
import { BlitzPage, useParam, useQuery, useMutation, Routes, Link } from "blitz"
import { Field, Form } from "react-final-form"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import UpsertTags from "app/tag/mutations/upsertTags"
import Navigation from "app/terminal/components/settings/navigation"
import Checkbox from "app/core/components/form/Checkbox"
import useToast from "app/core/hooks/useToast"
import useDiscordAuth from "app/core/hooks/useDiscordAuth"
import useDiscordGuild from "app/core/hooks/useDiscordGuild"

const DiscordSettingsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false }
  )
  const [addToast, Toast] = useToast()

  const [upsertTags] = useMutation(UpsertTags, {
    onSuccess: () => {
      addToast("Your roles have been updated.", "success")
    },
  })

  const [selectAllActive, setSelectAllActive] = useState(false)
  const { onOpen, authorization, error, isAuthenticating } = useDiscordAuth("guilds")
  const { status: guildStatus, guild: connectedGuild } = useDiscordGuild(terminal?.data?.guildId)

  // kind of confusing to explain, you probably need to see it to understand so I recorded a loom
  // https://www.loom.com/share/f5c67a2872854bb386330ddbb744a5d8
  const _initialFormValues = useMemo(() => {
    if (connectedGuild && terminal) {
      let allRoles = connectedGuild.roles.reduce((acc, role) => {
        let roleName = role.name.replace(".", "")
        acc[roleName] = {
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
      {!connectedGuild && !authorization && (
        <div className="w-full h-full flex items-center flex-col justify-center">
          <p className="text-marble-white text-2xl font-bold">Connect with Discord</p>
          <p className="mt-2 text-marble-white text-base w-[400px] text-center">
            Connect with Discord to synchronize roles and manage permissions & access on Station.
          </p>
          <button
            onClick={() => {
              onOpen()
            }}
            className="cursor-pointer mt-8 w-[200px] py-1 bg-magic-mint text-tunnel-black rounded text-base"
          >
            Connect
          </button>
        </div>
      )}

      {!connectedGuild && authorization && (
        <div className="flex flex-col">
          <div className="p-6 border-b border-concrete flex justify-between">
            <h2 className="text-marble-white text-2xl font-bold">Discord</h2>
          </div>
          <div className="p-6">
            Finish the discord integration{" "}
            <Link href={Routes.DiscordConnectPage({ terminalHandle })}>
              <span className="underline text-magic-mint cursor-pointer">here.</span>
            </Link>
          </div>
        </div>
      )}

      {terminal?.data.guildId && (
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
          mutators={{
            selectAll: (args, state, utils) => {
              Object.keys(state.formState.values).forEach((key) => {
                utils.changeValue(state, `${key}.active`, () => args[0])
              })
            },
          }}
          render={({ form, handleSubmit }) => {
            const formState = form.getState()
            return (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col">
                  <div className="p-6 border-b border-concrete flex justify-between">
                    <h2 className="text-marble-white text-2xl font-bold">Discord</h2>
                    <button
                      className={`rounded text-tunnel-black px-8 ${
                        formState.dirty ? "bg-magic-mint" : "bg-concrete"
                      }`}
                      type="submit"
                    >
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
                        <div>
                          <p
                            className="mt-6 mb-2 underline cursor-pointer inline-block"
                            onClick={() => {
                              setSelectAllActive(!selectAllActive)
                              form.mutators.selectAll?.(selectAllActive)
                            }}
                          >
                            {selectAllActive ? "Select all" : "Deselect all"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2">
                          {connectedGuild?.roles.map((role, idx) => {
                            let roleName = role.name.replace(".", "")
                            let cbState = form.getFieldState(roleName + ".active")
                            return (
                              <>
                                <div key={idx} className="flex flex-row items-center">
                                  <Checkbox name={`${roleName}.active`} checked={cbState?.value} />
                                  <p className="text-bold text-xs uppercase tracking-wider rounded-full px-2 py-0.5 bg-wet-concrete inline ml-2">
                                    {roleName}
                                  </p>
                                </div>
                                <div>
                                  <Field name={`${roleName}.type`}>
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
                                  <Field name={`${roleName}.discordId`}>
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
