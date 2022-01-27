import { useQuery, BlitzPage, useParam } from "blitz"
import { useMemo, useState, useEffect } from "react"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import getApplicationsByInitiative from "app/application/queries/getApplicationsByInitiative"
import { Application } from "app/application/types"
import ContributorCard from "app/core/components/ContributorCard"
import { Account } from "app/account/types"
import { users } from "app/core/utils/data"
import { useAccount } from "wagmi"
import EndorseModal from "app/core/components/EndorseModal"
import SuccessModal from "app/core/components/SuccessModal"

const TerminalWaitingPage: BlitzPage = () => {
  const [{ data: accountData }] = useAccount()
  const connectedUser: Account = useMemo(
    () => (accountData?.address ? users[accountData?.address] : null),
    [accountData?.address]
  )
  const terminalId = useParam("terminalId", "number") || 1
  const [selectedInitiative, setSelectedInitiative] = useState(0)
  const [applications, setApplications] = useState<Application[]>([])
  const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
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

  const contributor = {
    data: {
      name: "Mind",
      handle: "mindapi",
      address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
      ticketId: 2, // TODO: remove this when subgraph is ready
      pronouns: "she/her",
      skills: [],
      discord: "mindapi#",
      verified: true,
      wallet: "mindapi.eth",
      role: "STAFF",
      twitterURL: "https://twitter.com/mindapi_",
      pfpURL: "https://pbs.twimg.com/profile_images/1466504048006377472/KrC6aPam_400x400.jpg",
    },
  }

  return (
    <TerminalNavigation>
      {!initiatives || !initiatives.length ? (
        <div>There are no active applications in this terminal.</div>
      ) : (
        <>
          <EndorseModal
            isEndorseModalOpen={isEndorseModalOpen}
            setIsEndorseModalOpen={setIsEndorseModalOpen}
            setIsSuccessModalOpen={setIsSuccessModalOpen}
            selectedUserToEndorse={contributor}
          />
          <SuccessModal
            isSuccessModalOpen={isSuccessModalOpen}
            setIsSuccessModalOpen={setIsSuccessModalOpen}
            selectedUserToEndorse={contributor}
          />
          <div className="flex flex-col space-y-10">
            <button
              className="bg-neon-carrot border border-marble-white "
              onClick={() => setIsEndorseModalOpen(true)}
            >
              Endorse Modal
            </button>
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
        </>
      )}
    </TerminalNavigation>
  )
}

TerminalWaitingPage.suppressFirstRenderFlicker = true
TerminalWaitingPage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalWaitingPage
