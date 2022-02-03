import { useState, useEffect } from "react"
import { BlitzPage, useQuery, useParam, Routes, Link } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import InitiativeCard from "app/initiative/components/InitiativeCard"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"

const TerminalInitiativePage: BlitzPage = () => {
  const [sortedInitiatives, setSortedInitiatives] = useState<any[]>()
  const terminalHandle = useParam("terminalHandle", "string") as string

  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const [initiatives] = useQuery(
    getInitiativesByTerminal,
    { terminalId: terminal?.id || 0 },
    { suspense: false }
  )

  useEffect(() => {
    if (initiatives) {
      let index = initiatives.findIndex((init) => init.data.name === "Newstand")
      setSortedInitiatives(initiatives.slice(index).concat(initiatives.slice(0, index)))
    }
  }, [initiatives])

  return (
    <TerminalNavigation>
      {!initiatives ? (
        <div>There are no active initiatves in this terminal.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedInitiatives?.map?.(
            ({ localId, contributors, data: { name, oneLiner, isAcceptingApplications } }) => {
              return (
                <Link
                  key={localId}
                  href={Routes.Project({ terminalHandle, initiativeId: localId })}
                >
                  <a>
                    <InitiativeCard
                      title={name || "Title"}
                      oneLiner={oneLiner || "One Liner"}
                      contributors={contributors}
                      isAcceptingApplications={isAcceptingApplications}
                    />
                  </a>
                </Link>
              )
            }
          )}
        </div>
      )}
    </TerminalNavigation>
  )
}

TerminalInitiativePage.suppressFirstRenderFlicker = true
TerminalInitiativePage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalInitiativePage
