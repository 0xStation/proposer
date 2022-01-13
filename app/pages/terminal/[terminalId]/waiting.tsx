import { Image, useQuery, BlitzPage, useParam, Link, Routes } from "blitz"
import { useState, useEffect } from "react"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import getApplicationsByInitiative from "app/initiative/queries/getApplicationsByInitiative"

import InitiativeCard from "app/initiative/components/InitiativeCard"
import getAllAccounts from "app/account/queries/getAllAccounts"

const TerminalWaitingPage: BlitzPage = () => {
  const terminalId = useParam("terminalId", "number") || 1
  const [selectedInitiative, setSelectedInitiative] = useState(0)

  const [initiatives] = useQuery(
    getInitiativesByTerminal,
    { terminalId: terminalId },
    { suspense: false }
  )

  // let [applications]

  // function getApplications(initiative) => {
  //   const [applications] = useQuery(
  //     getInitiativesByTerminal,
  //   { terminalId: terminalId },
  //   { suspense: false }
  //   )
  // }

  useEffect(() => {}, [selectedInitiative])

  return (
    <TerminalNavigation>
      {!initiatives ? (
        <div>There are no active initiatives and initiatives applications in this terminal.</div>
      ) : (
        <div className="flex flex-col space-y-10">
          <div className="flex-1/5 flex flex-row space-x-3 text-marble-white text-sm">
            {initiatives.map((initiative) => {
              return (
                <button
                  key={initiative.localId}
                  onClick={() => {
                    setSelectedInitiative(initiative.localId)
                  }}
                  className="border border-marble-white rounded-xl hover:bg-marble-white hover:text-concrete h-[29px]"
                >
                  <span className="m-4">{initiative.data?.name}</span>
                </button>
              )
            })}
          </div>
          <div className="flex-4/5 text-marble-white grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div></div>
          </div>
        </div>
      )}
    </TerminalNavigation>
  )
}

TerminalWaitingPage.suppressFirstRenderFlicker = true
TerminalWaitingPage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalWaitingPage
