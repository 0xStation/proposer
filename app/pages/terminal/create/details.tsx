import { BlitzPage, useParam, useQuery } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import CreateTerminalProgressBar from "app/terminal/components/createTerminalProgressBar"

const CreateTerminalDetailsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false }
  )

  return (
    <main className="text-marble-white min-h-screen max-w-screen-sm mx-auto">
      <CreateTerminalProgressBar step={0} />
      <h2 className="text-2xl font-bold mt-8">Open a Terminal</h2>
      <h6 className="mt-2">
        Terminal is where members of your community collaborate and make decisions. Tell us about
        your Terminal.
      </h6>
    </main>
  )
}

CreateTerminalDetailsPage.suppressFirstRenderFlicker = true

export default CreateTerminalDetailsPage
