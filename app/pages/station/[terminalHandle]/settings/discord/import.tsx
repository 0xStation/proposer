import { useState, useMemo } from "react"
import { BlitzPage, useMutation, useParam, useQuery, Routes, useRouter } from "blitz"
import { Field, Form } from "react-final-form"
import UpsertTags from "app/tag/mutations/upsertTags"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import useDiscordGuild from "app/core/hooks/useDiscordGuild"
import useGuildMembers from "app/core/hooks/useGuildMembers"
import Checkbox from "app/core/components/form/Checkbox"
import useStore from "app/core/hooks/useStore"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import Button from "app/core/components/sds/buttons/Button"

const DiscordImportPage: BlitzPage = () => {
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false }
  )
  const setToastState = useStore((state) => state.setToastState)

  const [upsertTags] = useMutation(UpsertTags, {
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const [selectAllActive, setSelectAllActive] = useState(false)
  const { guild: connectedGuild } = useDiscordGuild(terminal?.data?.guildId)
  const { guildMembers } = useGuildMembers(terminal?.data?.guildId)

  const initialFormValues = useMemo(() => {
    if (connectedGuild && terminal) {
      let allRoles = connectedGuild.roles
        .filter((r) => !(r.managed || r.name === "@everyone"))
        .reduce((acc, role) => {
          let roleId = "x" + String(role.id)
          acc[roleId] = {
            active: true,
            type: "inactive",
            name: role.name,
          }
          return acc
        }, {})

      return allRoles
    } else {
      return {}
    }
  }, [connectedGuild, terminal])

  // wonder if we could use error boundaries for things like this
  if (!terminal) {
    return <></>
  }

  return (
    <LayoutWithoutNavigation>
      <div className="max-w-screen-sm mx-auto pt-12 flex flex-col">
        <div className="grid grid-cols-2 gap-2">
          <div className="border-t-4 border-light-concrete pt-2">
            <span className="text-sm text-light-concrete">Import with Discord</span>
          </div>
          <div className="border-t-4 border-electric-violet pt-2">
            <span className="text-sm text-electric-violet">Import roles and members</span>
          </div>
        </div>

        <div className="mt-12">
          <h1 className="text-2xl font-bold">Import roles and members.</h1>
          <p>Add your members with certain roles to your terminal.</p>
        </div>

        <Form
          initialValues={initialFormValues}
          onSubmit={async (values) => {
            let ids = Object.keys(values)
            let tags = ids.map((id) => {
              return {
                value: values[id].name,
                active: values[id].active,
                type: values[id].type,
                discordId: id.slice(1),
              }
            })

            if (terminal) {
              const createdTags = await upsertTags({
                tags,
                terminalId: terminal.id,
              })

              const activeCreatedTags = createdTags.filter((tag) => tag.active)
              const activeCreatedTagDiscordIds = activeCreatedTags.map((tag) => tag.discordId || "")
              const activeGuildMembers = guildMembers.filter((gm) => {
                return gm.roles.some((r) => activeCreatedTagDiscordIds.includes(r))
              })

              // refetch()
              try {
                await fetch("/api/discord/sync-roles", {
                  method: "POST",
                  body: JSON.stringify({
                    terminalId: terminal.id,
                  }),
                })
                router.push(Routes.DiscordSettingsPage({ terminalHandle: terminalHandle }))
              } catch (err) {
                console.error("Error creating accounts. Failed with ", err)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: "Something went wrong!",
                })
              }
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
                <div className="flex flex-col mt-4">
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
                    {connectedGuild?.roles
                      .filter((r) => !(r.managed || r.name === "@everyone"))
                      .map((role, idx) => {
                        let roleId = "x" + String(role.id)
                        let cbState = form.getFieldState(roleId + ".active")
                        return (
                          <>
                            <div key={idx} className="flex flex-row items-center">
                              <Checkbox name={`${roleId}.active`} checked={cbState?.value} />
                              <p className="text-bold text-xs uppercase tracking-wider rounded-full px-2 py-0.5 bg-wet-concrete inline ml-2">
                                {role.name}
                              </p>
                            </div>
                            <div>
                              <Field name={`${roleId}.type`}>
                                {({ input }) => (
                                  <div>
                                    <select
                                      {...input}
                                      className={`bg-tunnel-black w-[200px] ${
                                        !cbState?.value ? "text-wet-concrete" : "text-marble-white"
                                      }`}
                                      required={cbState?.value}
                                    >
                                      {cbState?.value ? (
                                        <>
                                          <option value="">Choose option</option>
                                          <option value="status">Status</option>
                                          <option value="season">Season</option>
                                          <option value="role">Role</option>
                                          <option value="project">Project</option>
                                          <option value="guild">Guild</option>
                                        </>
                                      ) : (
                                        <option value="">inactive</option>
                                      )}
                                    </select>
                                  </div>
                                )}
                              </Field>
                              <Field name={`${roleId}.name`}>
                                {({ input }) => (
                                  <input {...input} type="hidden" value={role.name} />
                                )}
                              </Field>
                            </div>
                          </>
                        )
                      })}
                  </div>
                  <div className="mt-12">
                    <Button isSubmitType={true} label="Done" isDisabled={!formState.dirty} />
                  </div>
                </div>
              </form>
            )
          }}
        />
      </div>
    </LayoutWithoutNavigation>
  )
}

export default DiscordImportPage
