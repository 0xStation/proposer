import { useState, useMemo } from "react"
import { BlitzPage, useMutation, useParam, useQuery, Routes, useRouter } from "blitz"
import { Field, Form } from "react-final-form"
import UpsertTags from "app/tag/mutations/upsertTags"
import createAccounts from "app/account/mutations/createAccounts"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import useDiscordGuild from "app/core/hooks/useDiscordGuild"
import useGuildMembers from "app/core/hooks/useGuildMembers"
import Checkbox from "app/core/components/form/Checkbox"
import useStore from "app/core/hooks/useStore"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"

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

  const [createAccountsMutation] = useMutation(createAccounts, {
    onSuccess: () => {
      router.push(Routes.DiscordSettingsPage({ terminalHandle: terminalHandle }))
    },
  })

  const [selectAllActive, setSelectAllActive] = useState(false)
  const { guild: connectedGuild } = useDiscordGuild(terminal?.data?.guildId)
  const { guildMembers } = useGuildMembers(terminal?.data?.guildId)

  const initialFormValues = useMemo(() => {
    if (connectedGuild && terminal) {
      let allRoles = connectedGuild.roles.reduce((acc, role) => {
        let roleName = role.name.replace(".", "")
        acc[roleName] = {
          active: true,
          type: "inactive",
          discordId: role.id,
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
          <div className="border-t-4 border-neon-blue pt-2">
            <span className="text-sm text-neon-blue">Import with Discord</span>
          </div>
          <div className="border-t-4 border-neon-blue pt-2">
            <span className="text-sm text-neon-blue">Import roles and members</span>
          </div>
        </div>

        <div className="mt-12">
          <h1 className="text-2xl font-bold">Import roles and members.</h1>
          <p>Add your members with certain roles to your terminal.</p>
        </div>

        <Form
          initialValues={initialFormValues}
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
                await createAccountsMutation({
                  terminalId: terminal.id,
                  users: activeGuildMembers.map((gm) => {
                    const tagOverlap = activeCreatedTagDiscordIds.filter((tag) =>
                      gm.roles.includes(tag)
                    )

                    const tagOverlapId = tagOverlap
                      .map((discordId) => {
                        const tag = activeCreatedTags.find((tag) => {
                          return tag.discordId === discordId
                        })

                        return tag?.id
                      })
                      .filter((tag): tag is number => !!tag) // remove possible undefined from `find` in map above

                    return {
                      discordId: gm.user.id,
                      name: gm.nick || gm.user.username,
                      tags: tagOverlapId,
                      avatarHash: gm.user.avatar,
                    }
                  }),
                })
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
                                      !cbState?.value ? "text-wet-concrete" : "text-marble-white"
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
                              {({ input }) => <input {...input} type="hidden" value={role.id} />}
                            </Field>
                          </div>
                        </>
                      )
                    })}
                  </div>
                  <div>
                    <button
                      className={`rounded text-tunnel-black px-8 mt-12 py-2 ${
                        formState.dirty ? "bg-magic-mint" : "bg-concrete"
                      }`}
                      type="submit"
                    >
                      Done
                    </button>
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
