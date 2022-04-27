import { useState, useEffect } from "react"
import { BlitzPage, useParam, useRouterQuery, useQuery } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"

type GuildOption = {
  img: string
  label: string
  value: string
}

type Guild = {
  roles: Role[]
}

type Role = {
  name: string
}

const SettingsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const [activeGuild, setActiveGuild] = useState<Guild>()

  useEffect(() => {
    const fetchAsync = async () => {
      // maybe add this in the data field of the terminals we support
      let selectedGuildId = "882488248591593553"
      const response = await fetch("/api/discord/get-guild", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guild_id: selectedGuildId }),
      })

      const guild = await response.json()
      setActiveGuild(guild)
    }
    fetchAsync()
  }, [])

  console.log(activeGuild)

  return (
    <main className="text-marble-white h-screen flex flex-row">
      <nav className="w-[70px] h-full border-r border-concrete"></nav>
      <section className="w-[300px] h-full border-r border-concrete p-6">
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
      </section>
      <section className="flex-1 h-full">
        {false && (
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
        <div className="flex flex-col">
          <div className="p-6 border-b border-concrete">
            <h2 className="text-marble-white text-2xl">Discord</h2>
            <p className="text-marble-white mt-4">Connect with discord to sync roles.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 border-b border-concrete pb-2">
              <header className="text-bold text-sm uppercase tracking-wider">Role</header>
              <header className="text-bold text-sm uppercase tracking-wider">Category</header>
            </div>
            <div className="grid grid-cols-2 mt-6 gap-y-2">
              {activeGuild?.roles.map((role) => {
                return (
                  <>
                    <div>
                      <p className="text-bold text-xs uppercase tracking-wider rounded-full px-2 py-0.5 bg-wet-concrete inline">
                        {role.name}
                      </p>
                    </div>
                    <div>
                      <select className="bg-tunnel-black w-[200px]">
                        <option>Select One</option>
                      </select>
                    </div>
                  </>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

SettingsPage.suppressFirstRenderFlicker = true

export default SettingsPage
