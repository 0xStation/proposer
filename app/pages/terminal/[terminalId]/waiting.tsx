import { useQuery, BlitzPage, useParam, Link, Routes } from "blitz"
import { useMemo, useState, useEffect } from "react"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import getApplicationsByInitiative from "app/application/queries/getApplicationsByInitiative"
import { Application } from "app/application/types"
import ContributorCard from "app/core/components/ContributorCard"
import { Account } from "app/account/types"
import { users } from "app/core/utils/data"
import ApplicantDetailsModal from "app/application/components/ApplicantDetailsModal"
import { object } from "zod"
import useStore from "app/core/hooks/useStore"
import { useAccount } from "wagmi"

const TerminalWaitingPage: BlitzPage = () => {
  const [{ data: accountData }] = useAccount()
  const connectedUser: Account = useMemo(
    () => (accountData?.address ? users[accountData?.address] : null),
    [accountData?.address]
  )
  const terminalId = useParam("terminalId", "number") || 1
  const [selectedInitiative, setSelectedInitiative] = useState<number>()
  const [applications, setApplications] = useState<Application[]>([])
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [selected, setSelected] = useState<boolean>(false)
  let [selectedApplicantToView, setselectedApplicantToView] = useState<number>(0)

  const accepted = false

  const [initiatives] = useQuery(
    getInitiativesByTerminal,
    { terminalId: terminalId },
    { suspense: false }
  )
  //We'll be using this to update the applications based on toggle click once we have actual applications
  // const [newApplications] = useQuery(
  //   getApplicationsByInitiative,
  //   { initiativeId: selectedInitiative },
  //   { suspense: false }
  // )
  const [isApplicantOpen, setIsApplicantOpen] = useState(false)
  const openApplicantModal = () => setIsApplicantOpen(!isApplicantOpen)
  const activeUser: Account | null = useStore((state) => state.activeUser)

  useEffect(() => {
    if (selectedInitiative == 1) {
      const apps: Application[] = [
        {
          id: 0,
          applicant: dummyData[0] as Account,
          applicantId: 0,
          initiative: {
            id: 0,
            terminalId: 0,
            terminalTicket: "",
            localId: 0,
            data: {
              name: "Protocol",
              description: "",
              shortName: "",
              isAcceptingApplications: false,
              links: [],
            },
          },
          initiativeId: 0,
          endorsements: [dummyData[0] as Account],
          data: {
            why: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
            url: "abe.com",
          },
        },
        {
          id: 1,
          applicant: dummyData[1] as Account,
          applicantId: 1,
          initiative: {
            id: 0,
            terminalId: 0,
            terminalTicket: "",
            localId: 0,
            data: {
              name: "Protocol",
              description: "",
              shortName: "",
              isAcceptingApplications: false,
              links: [],
            },
          },
          initiativeId: 1,
          endorsements: [dummyData[0] as Account, dummyData[1] as Account],
          data: {
            why: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
            url: "abe.com",
          },
        },
        {
          id: 2,
          applicant: dummyData[2] as Account,
          applicantId: 2,
          initiative: {
            id: 0,
            terminalId: 0,
            terminalTicket: "",
            localId: 0,
            data: {
              name: "Protocol",
              description: "",
              shortName: "",
              isAcceptingApplications: false,
              links: [],
            },
          },
          initiativeId: 2,
          endorsements: [],
          data: {
            why: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
            url: "abe.com",
          },
        },
      ]
      setAllApplications(apps)
    } else if (selectedInitiative == 2) {
      const apps = [
        {
          id: 2,
          applicant: dummyData[2] as Account,
          applicantId: 2,
          initiative: {
            id: 0,
            terminalId: 0,
            terminalTicket: "",
            localId: 0,
            data: {
              name: "Web",
              description: "",
              shortName: "",
              isAcceptingApplications: false,
              links: [],
            },
          },
          initiativeId: 2,
          endorsements: [],
          data: {
            why: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
            url: "abe.com",
          },
        },
      ]
      setAllApplications(apps)
    } else if (selectedInitiative == 3) {
      const apps = [
        {
          id: 1,
          applicant: dummyData[1] as Account,
          applicantId: 1,
          initiative: {
            id: 0,
            terminalId: 0,
            terminalTicket: "",
            localId: 0,
            data: {
              name: "Newstand",
              description: "",
              shortName: "",
              isAcceptingApplications: false,
              links: [],
            },
          },
          initiativeId: 1,
          endorsements: [],
          data: {},
        },
        {
          id: 2,
          applicant: dummyData[2] as Account,
          applicantId: 2,
          initiative: {
            id: 0,
            terminalId: 0,
            terminalTicket: "",
            localId: 0,
            data: {
              name: "Newstand",
              description: "",
              shortName: "",
              isAcceptingApplications: false,
              links: [],
            },
          },
          initiativeId: 2,
          endorsements: [],
          data: {},
        },
      ]
      setAllApplications(apps)
    } else {
      setAllApplications([])
    }
    // This will actually be the only call within the function once we have applicants in the DB
    // setApplications(newApplications || [])
  }, [selectedInitiative])

  const dummyData: Account[] = [
    {
      id: 0,
      address: "me",
      data: {
        name: "Abe",
        handle: "cryptoabe",
        pronouns: "he/him",
        skills: ["Design"],
        discord: "cryptoabe#",
        verified: true,
        wallet: "0x420...6d9",
        role: "COMMUTER",
        twitterURL: "https://twitter.com/abenazer_mekete",
        pfpURL: "https://pbs.twimg.com/profile_images/1480266187934257155/aRArmGkH_400x400.jpg",
        timezone: "Eastern Standard Time (GMT -5)",
      },
    },
    {
      id: 1,
      address: "address",
      data: {
        name: "Tina",
        handle: "fakepixels",
        pronouns: "she/her",
        skills: ["Design"],
        discord: "fakepixels#",
        verified: true,
        wallet: "fkpixels.eth",
        role: "STAFF",
        twitterURL: "https://twitter.com/fkpxls",
        pfpURL: "https://pbs.twimg.com/profile_images/1470115904289574913/7t4TlLQd_400x400.jpg",
        timezone: "Eastern Standard Time (GMT -5)",
      },
    },
    {
      id: 2,
      address: "address",
      data: {
        name: "Mind",
        handle: "mindapi",
        pronouns: "she/her",
        skills: ["Design"],
        discord: "mindapi#",
        verified: true,
        wallet: "mindapi.eth",
        role: "STAFF",
        twitterURL: "https://twitter.com/mindapi_",
        pfpURL: "https://pbs.twimg.com/profile_images/1466504048006377472/KrC6aPam_400x400.jpg",
        timezone: "Eastern Standard Time (GMT -5)",
      },
    },
  ]
  const preSet = () => {
    setSelectedInitiative(1)
    setSelected(true)
  }

  let endorseAbility = false
  if (connectedUser) {
    if (connectedUser.data?.role !== "N/A") {
      endorseAbility = true
    }
  }
  const setIniative = (id) => {
    setSelectedInitiative(id)
    setSelected(true)
  }

  return (
    <TerminalNavigation>
      {!initiatives || !initiatives.length ? (
        <div>There are no active applications in this terminal.</div>
      ) : (
        <div>
          {activeUser?.address ? (
            <ApplicantDetailsModal
              application={allApplications[selectedApplicantToView]}
              isApplicantOpen={isApplicantOpen}
              setIsApplicantOpen={setIsApplicantOpen}
              activeUser={activeUser}
            />
          ) : (
            <ApplicantDetailsModal
              application={allApplications[selectedApplicantToView]}
              isApplicantOpen={isApplicantOpen}
              setIsApplicantOpen={setIsApplicantOpen}
            />
          )}

          <div className="flex flex-col space-y-10">
            <div className="flex-auto flex flex-row space-x-3 text-marble-white text-sm">
              {initiatives.map((initiative) => {
                return (
                  <button
                    key={initiative.localId}
                    onClick={() => {
                      setIniative(initiative.localId)
                      // setSelectedInitiative(initiative.localId)
                      // setSelected(true)
                    }}
                    className={`${
                      initiative.localId == selectedInitiative && "bg-marble-white text-concrete"
                    } border border-marble-white rounded-xl h-[29px] ${
                      initiative.localId != selectedInitiative && "border border-marble-white"
                    } active:bg-marble-white active:text-concrete`}
                  >
                    <span className="m-4">{initiative.data?.name}</span>
                  </button>
                )
              })}
              {!selected && preSet()}
            </div>
            <div className="flex-auto text-marble-white">
              {!allApplications || !allApplications.length ? (
                <div>
                  {selected ? (
                    <div>There are no active applications for this initiative.</div>
                  ) : (
                    <div>Please select an initiative to view applications.</div>
                  )}
                </div>
              ) : (
                //We'll actually be using this once we have applications in the backend
                // <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" onClick={() => {}}>
                //   {applications.map((application, index) => (
                //     <ContributorCard
                //       key={index}
                //       contributor={application.applicant as Account}
                //       endorse={endorseAbility}
                //       accepted={accepted}
                //       openApplicantModal={openApplicantModal}
                //       setselectedApplicantToView={setselectedApplicantToView}
                //     />
                //   ))}
                // </div>
                <div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allApplications.map((applications, index) => (
                      <ContributorCard
                        key={index}
                        value={index}
                        contributor={applications.applicant as Account}
                        endorse={endorseAbility}
                        accepted={accepted}
                        openApplicantModal={openApplicantModal}
                        setselectedApplicantToView={setselectedApplicantToView}
                        activeUser={activeUser}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </TerminalNavigation>
  )
}

TerminalWaitingPage.suppressFirstRenderFlicker = true
TerminalWaitingPage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalWaitingPage
