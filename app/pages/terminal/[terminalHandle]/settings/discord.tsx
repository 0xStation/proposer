import { useState, useMemo } from "react"
import {
  BlitzPage,
  useParam,
  useQuery,
  useMutation,
  Routes,
  Link,
  useRouter,
  GetServerSideProps,
  getSession,
  invoke,
} from "blitz"
import { Field, Form } from "react-final-form"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import UpsertTags from "app/tag/mutations/upsertTags"
import createAccounts from "app/account/mutations/createAccounts"
import Navigation from "app/terminal/components/settings/navigation"
import Checkbox from "app/core/components/form/Checkbox"
import useDiscordAuthWithCallback from "app/core/hooks/useDiscordAuthWithCallback"
import useDiscordGuild from "app/core/hooks/useDiscordGuild"
import useGuildMembers from "app/core/hooks/useGuildMembers"
import NoSsr from "app/core/components/NoSsr"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import useStore from "app/core/hooks/useStore"

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

  if (!terminal?.data?.permissions?.accountWhitelist?.includes(session?.siwe?.address as string)) {
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

const DiscordSettingsPage: BlitzPage = () => {
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false }
  )
  const setToastState = useStore((state) => state.setToastState)

  const [upsertTags] = useMutation(UpsertTags, {
    onSuccess: () => {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Your roles have been updated.",
      })
    },
  })

  const [createAccountsMutation] = useMutation(createAccounts)

  const [selectAllActive, setSelectAllActive] = useState(false)
  const { callbackWithDCAuth: onOpen, authorization } = useDiscordAuthWithCallback("guilds", () => {
    router.push(Routes.DiscordConnectPage({ terminalHandle: terminalHandle }))
  })
  const { guild: connectedGuild } = useDiscordGuild(terminal?.data?.guildId)
  const { guildMembers } = useGuildMembers(terminal?.data?.guildId)

  // kind of confusing to explain, you probably need to see it to understand so I recorded a loom
  // https://www.loom.com/share/f5c67a2872854bb386330ddbb744a5d8
  const _initialFormValues = useMemo(() => {
    if (connectedGuild && terminal) {
      let allRoles = connectedGuild.roles.reduce((acc, role) => {
        let roleId = "x" + String(role.id)
        acc[roleId] = {
          active: true,
          type: "inactive",
          name: role.name,
        }
        return acc
      }, {})

      let existingDiscordRoles = terminal?.tags.filter((tag) => tag.discordId)
      let existingRoles = existingDiscordRoles.reduce((acc, tag) => {
        if (tag.discordId) {
          acc["x" + tag.discordId] = {
            type: tag.type,
            active: tag.active,
            name: tag.value,
          }
        }
        return acc
      }, {})

      return Object.assign(allRoles, existingRoles)
    } else {
      return {}
    }
  }, [connectedGuild, terminal])

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <NoSsr>
          {!connectedGuild && (
            <>
              {authorization ? (
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
              ) : (
                <div className="w-full h-full flex items-center flex-col justify-center">
                  <p className="text-marble-white text-2xl font-bold">Connect with Discord</p>
                  <p className="mt-2 text-marble-white text-base w-[400px] text-center">
                    Connect with Discord to import roles and members.
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
            </>
          )}
        </NoSsr>

        {terminal?.data.guildId && (
          <Form
            initialValues={_initialFormValues}
            onSubmit={async (values) => {
              let ids = Object.keys(values)
              let tags = ids.map((id) => {
                return {
                  discordId: id.slice(1),
                  value: values[id].name,
                  active: values[id].active,
                  type: values[id].type,
                }
              })

              if (terminal) {
                const createdTags = await upsertTags({
                  tags,
                  terminalId: terminal.id,
                })
                const activeCreatedTags = createdTags.filter((tag) => tag.active)
                const activeCreatedTagDiscordIds = activeCreatedTags.map(
                  (tag) => tag.discordId || ""
                )
                const activeGuildMembers = guildMembers.filter((gm) => {
                  return gm.roles.some((r) => activeCreatedTagDiscordIds.includes(r))
                })

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
                        joinedAt: gm.joined_at,
                        ...(gm.user.avatar && { avatarHash: gm.user.avatar }),
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
                      <div>
                        <button
                          className={`rounded text-tunnel-black px-8 h-full ${
                            formState.dirty ? "bg-magic-mint" : "bg-concrete"
                          }`}
                          type="submit"
                        >
                          Save
                        </button>
                      </div>
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
                                              !cbState?.value
                                                ? "text-wet-concrete"
                                                : "text-marble-white"
                                            }`}
                                            required={cbState?.value}
                                          >
                                            {cbState?.value ? (
                                              <>
                                                <option value="">Choose option</option>
                                                <option value="status">Status</option>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )
            }}
          />
        )}
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

DiscordSettingsPage.suppressFirstRenderFlicker = true

export default DiscordSettingsPage
