import { useState, useEffect } from "react"
import { BlitzPage, useParam, useRouterQuery } from "blitz"

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
  const [token, setToken] = useState<string | null>(null)
  const [activeGuild, setActiveGuild] = useState<Guild>()
  const [selectedGuildId, setSelectedGuildId] = useState<string>()
  const [usersGuilds, setUsersGuilds] = useState<GuildOption[]>([])
  const query = useRouterQuery()

  // effect hook to get the access token when the user auths and a code is given through the url
  // there are ways to do this without url (see guild.xyz) but this is by far easiest for now
  useEffect(() => {
    const asyncFetch = async () => {
      const response = await fetch("api/exchange-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: query.code }),
      })

      const { access_token } = await response.json()
      setToken(access_token)
    }
    if (query.code && !token) {
      asyncFetch()
    }
  }, [query.code])

  // if the access_token exists, fetch all of the users guilds where the permission is admin
  useEffect(() => {
    const asyncFetch = async () => {
      let response = await fetch(`https://discord.com/api/v8/users/@me/guilds`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      let guilds = await response.json()
      if (Array.isArray(guilds)) {
        guilds = guilds
          .filter(({ owner, permissions }) => owner || (permissions & (1 << 3)) === 1 << 3)
          .map(({ id, icon, name }) => ({
            img: icon
              ? `https://cdn.discordapp.com/icons/${id}/${icon}.png`
              : "./default_discord_icon.png",
            label: name,
            value: id,
          }))
        setUsersGuilds(guilds)
      }
    }
    if (token) {
      asyncFetch()
    }
  }, [token])

  useEffect(() => {
    const fetchAsync = async () => {
      if (selectedGuildId) {
        const response = await fetch("api/get-guild", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ guild_id: selectedGuildId }),
        })

        const guild = await response.json()
        setActiveGuild(guild)
      }
    }
    fetchAsync()
  }, [selectedGuildId])

  return (
    <main className="text-marble-white h-screen flex flex-row">
      <nav className="w-[70px] h-full border-r border-concrete"></nav>
      <section className="w-[300px] h-full border-r border-concrete p-4">
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
        <div className="w-full h-full flex items-center flex-col justify-center">
          <p className="text-marble-white text-2xl font-bold">Connect with Discord</p>
          <p className="mt-2 text-marble-white text-base w-[400px] text-center">
            Connect with Discord to synchronize roles and manage permissions & access on Station.
          </p>
          <a href="https://discord.com/api/oauth2/authorize?client_id=963465926353752104&redirect_uri=http%3A%2F%2Flocalhost%3A3000/discord&response_type=code&scope=identify%20guilds%20guilds.join%20guilds.members.read">
            <button className="cursor-pointer mt-8 w-[200px] py-1 bg-magic-mint text-tunnel-black rounded text-base">
              Connect
            </button>
          </a>
        </div>
      </section>
    </main>
  )
}

SettingsPage.suppressFirstRenderFlicker = true

export default SettingsPage
