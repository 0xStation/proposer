import { Image, useQuery, BlitzPage, useParam, Link, Routes } from "blitz"
import { useMemo, useState, useEffect } from "react"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import getApplicationsByInitiative from "app/application/queries/getApplicationsByInitiative"
import { Application } from "app/application/types"
import ContributorCard from "app/core/components/ContributorCard"
import { Account } from "app/account/types"
import { useEthers } from "@usedapp/core"
import { users } from "app/core/utils/data"

const TerminalWaitingPage: BlitzPage = () => {
  const { account } = useEthers()
  const connectedUser: Account = useMemo(() => (account ? users[account] : null), [account])
  const terminalId = useParam("terminalId", "number") || 1
  const [selectedInitiative, setSelectedInitiative] = useState(0)
  const [applications, setApplications] = useState<Application[]>([])
  const accepted = false
  let endorseAbility = false
  if (connectedUser) {
    if (connectedUser.data?.role !== "N/A") {
      endorseAbility = true
    }
  }

  const [initiatives] = useQuery(
    getInitiativesByTerminal,
    { terminalId: terminalId },
    { suspense: false }
  )

  const [newApplications] = useQuery(
    getApplicationsByInitiative,
    { initiativeId: selectedInitiative },
    { suspense: false }
  )

  useEffect(() => {
    setApplications(newApplications || [])
  }, [selectedInitiative])

  return (
    <TerminalNavigation>
      {!initiatives || !initiatives.length ? (
        <div>There are no active applications in this terminal.</div>
      ) : (
        <div className="flex flex-col space-y-10">
          <div className="flex-auto flex flex-row space-x-3 text-marble-white text-sm">
            {initiatives.map((initiative) => {
              return (
                <button
                  key={initiative.localId}
                  onClick={() => {
                    setSelectedInitiative(initiative.localId)
                  }}
                  className={`${
                    initiative.localId == selectedInitiative && "bg-marble-white text-concrete"
                  } border border-marble-white rounded-xl h-[29px] ${
                    initiative.localId != selectedInitiative && " border border-marble-white"
                  } active:bg-marble-white active:text-concrete`}
                >
                  <span className="m-4">{initiative.data?.name}</span>
                </button>
              )
            })}
          </div>
          <div className="flex-auto text-marble-white">
            {!applications || !applications.length ? (
              <div>There are no active applications for this initiative.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" onClick={() => {}}>
                {applications.map((application, index) => (
                  <ContributorCard
                    key={index}
                    contributor={application.applicant as Account}
                    endorse={endorseAbility}
                    accepted={accepted}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </TerminalNavigation>
  )
}

TerminalWaitingPage.suppressFirstRenderFlicker = true
TerminalWaitingPage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalWaitingPage
