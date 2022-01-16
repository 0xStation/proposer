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

  let dummyData: Account[] = [
    {
      id: 2,
      address: "address",
      data: {
        name: "Mind",
        handle: "mindapi",
        pronouns: "she/her",
        skills: [],
        discord: "mindapi#",
        verified: true,
        wallet: "mindapi.eth",
        role: "STAFF",
        twitterURL: "https://twitter.com/mindapi_",
        pfpURL: "https://pbs.twimg.com/profile_images/1466504048006377472/KrC6aPam_400x400.jpg",
      },
    },
  ]

  if (selectedInitiative == 0) {
    dummyData = [
      {
        id: 0,
        address: "address",
        data: {
          name: "Abe",
          handle: "cryptoabe",
          pronouns: "he/him",
          skills: [],
          discord: "cryptoabe#",
          verified: true,
          wallet: "0x420...6d9",
          role: "COMMUTER",
          twitterURL: "https://twitter.com/abenazer_mekete",
          pfpURL: "https://pbs.twimg.com/profile_images/1480266187934257155/aRArmGkH_400x400.jpg",
        },
      },
    ]
  } else if (selectedInitiative == 1) {
    dummyData = [
      {
        id: 0,
        address: "address",
        data: {
          name: "Tina",
          handle: "fakepixels",
          pronouns: "she/her",
          skills: [],
          discord: "fakepixels#",
          verified: true,
          wallet: "fkpixels.eth",
          role: "STAFF",
          twitterURL: "https://twitter.com/fkpxls",
          pfpURL: "https://pbs.twimg.com/profile_images/1470115904289574913/7t4TlLQd_400x400.jpg",
        },
      },
      {
        id: 1,
        address: "address",
        data: {
          name: "Abe",
          handle: "cryptoabe",
          pronouns: "he/him",
          skills: [],
          discord: "cryptoabe#",
          verified: true,
          wallet: "0x420...6d9",
          role: "COMMUTER",
          twitterURL: "https://twitter.com/abenazer_mekete",
          pfpURL: "https://pbs.twimg.com/profile_images/1480266187934257155/aRArmGkH_400x400.jpg",
        },
      },
      {
        id: 2,
        address: "address",
        data: {
          name: "Mind",
          handle: "mindapi",
          pronouns: "she/her",
          skills: [],
          discord: "mindapi#",
          verified: true,
          wallet: "mindapi.eth",
          role: "STAFF",
          twitterURL: "https://twitter.com/mindapi_",
          pfpURL: "https://pbs.twimg.com/profile_images/1466504048006377472/KrC6aPam_400x400.jpg",
        },
      },
    ]
  } else if (selectedInitiative == 2) {
    dummyData = [
      {
        id: 0,
        address: "address",
        data: {
          name: "Abe",
          handle: "cryptoabe",
          pronouns: "he/him",
          skills: [],
          discord: "cryptoabe#",
          verified: true,
          wallet: "0x420...6d9",
          role: "COMMUTER",
          twitterURL: "https://twitter.com/abenazer_mekete",
          pfpURL: "https://pbs.twimg.com/profile_images/1480266187934257155/aRArmGkH_400x400.jpg",
        },
      },
    ]
  }

  return (
    <TerminalNavigation>
      {!initiatives ? (
        <div>There are no active initiatives and initiatives applications in this terminal.</div>
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
                  className="border border-marble-white rounded-xl hover:bg-marble-white hover:text-concrete h-[29px]"
                >
                  <span className="m-4">{initiative.data?.name}</span>
                </button>
              )
            })}
          </div>
          <div className="flex-auto text-marble-white">
            {!applications ? (
              <div>There are no applications for this initiative.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dummyData.map((data) => {
                  return ContributorCard(data as Account, accepted, endorseAbility)
                })}
              </div>
              // This is the actual component we will be using once the schema is updated
              // <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              //   {applications.map((application) => {
              //     return ContributorCard(application.applicant as Account)
              //   })}
              // </div>
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
