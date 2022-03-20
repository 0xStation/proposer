import { useState, useEffect } from "react"
import { BlitzPage, useQuery, useParam, Routes, Link } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import InitiativeCard from "app/initiative/components/InitiativeCard"
import useStore from "app/core/hooks/useStore"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import { QUERY_PARAMETERS } from "app/core/utils/constants"
import { canEdit } from "app/core/utils/permissions"

const TerminalInitiativePage: BlitzPage = () => {
  const { DIRECTED_FROM } = QUERY_PARAMETERS
  const [sortedInitiatives, setSortedInitiatives] = useState<any[]>()
  const terminalHandle = useParam("terminalHandle", "string") as string

  const activeUser = useStore((state) => state.activeUser)
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const userCanEdit = activeUser ? canEdit(activeUser, terminal?.id, "initiative") : false

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
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Initiatives`}>
      <TerminalNavigation>
        {!initiatives ? (
          <div>There are no active initiatves in this terminal.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedInitiatives?.map?.(
              (
                { localId, contributors, data: { name, oneLiner, isAcceptingApplications } },
                idx
              ) => {
                return (
                  <InitiativeCard
                    key={idx}
                    viewLink={Routes.Project({
                      terminalHandle,
                      initiativeId: localId,
                      directedFrom: DIRECTED_FROM.INITIATIVE_BOARD,
                    })}
                    editLink={Routes.TerminalInitiativeEditPage({
                      terminalHandle,
                      initiativeId: localId,
                    })}
                    editable={userCanEdit}
                    title={name || "Title"}
                    oneLiner={oneLiner || "One Liner"}
                    contributors={contributors}
                    isAcceptingApplications={isAcceptingApplications}
                  />
                )
              }
            )}
          </div>
        )}
      </TerminalNavigation>
    </Layout>
  )
}

TerminalInitiativePage.suppressFirstRenderFlicker = true

export default TerminalInitiativePage
