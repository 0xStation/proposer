import { useEffect, useState } from "react"
import { BlitzPage, useParam, useQuery, useRouter } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import CreateTerminalProgressBar from "app/terminal/components/createTerminalProgressBar"

const CreateTerminalPropertiesPage: BlitzPage = () => {
  const router = useRouter()
  const [data, setData] = useState()
  const [guilds, setGuilds] = useState<any[] | null>(null)
  const [activeGuildId, setActiveGuildId] = useState<string>()

  let redirectUri = `http://localhost:3000${router.pathname}`

  useEffect(() => {
    if (router.query.code && !data) {
      fetch("/api/discord/exchange-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: router.query.code }),
      })
        .then((res) => res.json())
        .then((data) => {
          setData(data)
        })
    }
  }, [router.query.code])

  useEffect(() => {
    const fetchData = async (data) => {
      if (data) {
        let response = await fetch(`https://discord.com/api/v8/users/@me/guilds`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access_token}`,
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
          setGuilds(guilds)
        }
      }
    }
    fetchData(data)
  }, [data])

  console.log(guilds)

  return (
    <main className="text-marble-white min-h-screen max-w-screen-sm mx-auto">
      <CreateTerminalProgressBar step={1} />
      <h2 className="text-2xl font-bold mt-12">Add member properties</h2>
      <h6 className="mt-2">Member properties help your community understand who each other are.</h6>
      {!guilds && (
        <a
          className="border border-marble-white w-full rounded mt-12 py-1"
          href={`https://discord.com/api/oauth2/authorize?client_id=963465926353752104&redirect_uri=${encodeURIComponent(
            redirectUri
          )}&response_type=code&scope=identify%20guilds%20guilds.join%20guilds.members.read`}
        >
          Connect with Discord
        </a>
      )}
      {guilds && (
        <>
          <label className="mt-4 block mb-1">Select a server</label>
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
      {activeGuildId && (
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
    </main>
  )
}

CreateTerminalPropertiesPage.suppressFirstRenderFlicker = true

export default CreateTerminalPropertiesPage
