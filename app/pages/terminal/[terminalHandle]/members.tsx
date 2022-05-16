import { useEffect, useState, useMemo } from "react"
import { BlitzPage, useRouter, useParam, useQuery, useMutation } from "blitz"
import { Field, Form } from "react-final-form"
import useGuild from "app/core/hooks/useGuild"
import useGuildMembers from "app/core/hooks/useGuildMembers"
import useActiveUserGuilds from "app/core/hooks/useActiveUserGuilds"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import UpsertTags from "app/tag/mutations/upsertTags"
import Checkbox from "app/core/components/form/Checkbox"
import useDCAuth from "app/core/hooks/useDCAuth"

const AddMembersPage: BlitzPage = () => {
  // the selectedGuild from the dropdown of guilds
  // this is the guild we will likely be adding the bot to
  const [activeGuildId, setActiveGuildId] = useState<string>("")
  const [selectAllActive, setSelectAllActive] = useState(true)

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false }
  )

  const [upsertTags] = useMutation(UpsertTags, {
    onSuccess: () => {
      console.log("success")
    },
  })

  const { status: guildStatus, guild } = useGuild(activeGuildId)
  const { status: memberStatus, guildMembers } = useGuildMembers(activeGuildId)
  const { status: guildsStatus, guilds } = useActiveUserGuilds()
  const { onOpen, authorization, error, isAuthenticating } = useDCAuth("guilds")

  const initialFormValues = useMemo(() => {
    if (guild) {
      let allRoles = guild.roles.reduce((acc, role) => {
        let roleName = role.name.replace(".", "")
        acc[roleName] = {
          active: true,
          type: "inactive",
        }
        return acc
      }, {})

      return allRoles
    }
  }, [guild])

  return (
    <main className="text-marble-white min-h-screen max-w-screen-sm mx-auto">
      <h2 className="text-2xl font-bold mt-12">Add member properties</h2>
      <h6 className="mt-2">Member properties help your community understand who each other are.</h6>
      {!terminal ? (
        <div className="mt-4">Sorry, this url is not a valid terminal.</div>
      ) : (
        <>
          {!guilds && (
            <button
              onClick={() => {
                onOpen()
              }}
              className="border border-marble-white w-full rounded mt-12 py-1 block text-center"
            >
              Connect with Discord
            </button>
          )}
          {guilds && (
            <>
              <label className="mt-4 block mb-1">Select a server*</label>
              <select
                className="w-full p-2 bg-wet-concrete border rounded"
                onChange={(e) => setActiveGuildId(e.target.value)}
              >
                <option>Select one</option>
                {guilds.map((guild, idx) => {
                  return (
                    <option value={guild.value} key={idx}>
                      {guild.label}
                    </option>
                  )
                })}
              </select>
            </>
          )}
          {activeGuildId && guildStatus !== "ready" && (
            <div>
              <button
                className="border border-marble-white w-full rounded mt-4 py-2"
                onClick={() =>
                  // make this use client id from env and redirect uri from env
                  window.open(
                    `https://discord.com/api/oauth2/authorize?guild_id=${activeGuildId}&client_id=963465926353752104&permissions=268435456&scope=bot`
                  )
                }
              >
                Connect Station bot
              </button>
            </div>
          )}

          {activeGuildId && guildStatus === "ready" && (
            <div>
              <button className="border border-marble-white w-full rounded mt-4 py-2 cursor-default">
                Connected
              </button>
            </div>
          )}

          {guild && (
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
                return (
                  <form onSubmit={handleSubmit} className="mt-8 pb-12">
                    <h3 className="font-bold">Select and sort roles*</h3>
                    <span className="text-concrete text-xs mt-1">
                      Select relevant roles to import. Sort them into categories.
                    </span>
                    <div>
                      <p
                        className="mt-6 underline cursor-pointer inline-block"
                        onClick={() => {
                          setSelectAllActive(!selectAllActive)
                          form.mutators.selectAll?.(!selectAllActive)
                        }}
                      >
                        {!selectAllActive ? "Select all" : "Deselect all"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 mt-4">
                      {guild.roles.map((role, idx) => {
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
                                      className={`bg-tunnel-black w-[200px] float-right ${
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
                    <button
                      className="rounded text-tunnel-black bg-magic-mint px-12 py-2 mt-4"
                      type="submit"
                    >
                      Save
                    </button>
                  </form>
                )
              }}
            />
          )}
        </>
      )}
    </main>
  )
}

AddMembersPage.suppressFirstRenderFlicker = true

export default AddMembersPage
