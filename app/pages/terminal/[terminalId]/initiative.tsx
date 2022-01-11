import { BlitzPage, useQuery, useParam, Routes, Link } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import InitiativeCard from "app/initiative/components/InitiativeCard"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import getAllAccounts from "app/account/queries/getAllAccounts"

const TerminalInitiativePage: BlitzPage = () => {
  const terminalId = useParam("terminalId", "number") || 1

  const [initiatives] = useQuery(
    getInitiativesByTerminal,
    { terminalId: terminalId },
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
          {initiatives.map((initiative) => {
            return (
              <Link
                key={initiative.id}
                href={Routes.Project({ terminalId, initiativeId: initiative.id })}
              >
                <a>
                  <InitiativeCard
                    title={initiative?.data?.name || "Title"}
                    description={initiative?.data?.description || "Description"}
                    contributors={contributors}
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
