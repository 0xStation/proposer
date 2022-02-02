import { BlitzPage, useQuery, useParam, Routes, Link } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import InitiativeCard from "app/initiative/components/InitiativeCard"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import getAllAccounts from "app/account/queries/getAllAccounts"

const TerminalInitiativePage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle", "string") as string

  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const [initiatives] = useQuery(
    getInitiativesByTerminal,
    { terminalId: terminal?.id || 0 },
    { suspense: false }
  )

  let [contributors] = useQuery(getAllAccounts, {}, { suspense: false })
  if (!contributors) {
    contributors = []
  }

  return (
    <TerminalNavigation>
      {!initiatives ? (
        <div>There are no active initiatves in this terminal.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initiatives?.map?.(({ localId, data: { name, description, members } }) => {
            return (
              <Link key={localId} href={Routes.Project({ terminalHandle, initiativeId: localId })}>
                <a>
                  <InitiativeCard
                    title={name || "Title"}
                    description={description || "Description"}
                    members={members}
                  />
                </a>
              </Link>
            )
          })}
        </div>
      )}
    </TerminalNavigation>
  )
}

TerminalInitiativePage.suppressFirstRenderFlicker = true
TerminalInitiativePage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalInitiativePage
