import { BlitzPage, useParam, useQuery } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import CreateTerminalProgressBar from "app/terminal/components/createTerminalProgressBar"

const CreateTerminalPropertiesPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false }
  )

  return (
    <main className="text-marble-white min-h-screen max-w-screen-sm mx-auto">
      <CreateTerminalProgressBar step={1} />
      <h2 className="text-2xl font-bold mt-12">Add member properties</h2>
      <h6 className="mt-2">Member properties help your community understand who each other are.</h6>
      <button
        className="border border-marble-white w-full rounded mt-12 py-1"
        onClick={() =>
          // make this use client id from env and redirect uri from env
          window.open(
            `https://discord.com/api/oauth2/authorize?client_id=963465926353752104&redirect_uri=http%3A%2F%2Flocalhost%3A3000/discord&response_type=code&scope=identify%20guilds%20guilds.join%20guilds.members.read`
          )
        }
      >
        Connect with Discord
      </button>
    </main>
  )
}

CreateTerminalPropertiesPage.suppressFirstRenderFlicker = true

export default CreateTerminalPropertiesPage
