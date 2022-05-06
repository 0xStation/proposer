import { BlitzPage, useParam, useQuery } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import CreateTerminalProgressBar from "app/terminal/components/createTerminalProgressBar"

const CreateTerminalInvitePage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { refetch }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false }
  )

  return (
    <main className="text-marble-white min-h-screen max-w-screen-sm mx-auto">
      <CreateTerminalProgressBar step={2} />
      <h2 className="text-2xl font-bold mt-8">Invite members</h2>
      <h6 className="mt-2">
        Share the invite link with your members so they can claim their profiles.
      </h6>
    </main>
  )
}

CreateTerminalInvitePage.suppressFirstRenderFlicker = true

export default CreateTerminalInvitePage
