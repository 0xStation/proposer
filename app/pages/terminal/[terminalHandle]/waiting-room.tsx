import { useQuery, BlitzPage, useParam, useRouterQuery, invoke } from "blitz"
import { useMemo, useState, useEffect } from "react"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import { Application } from "app/application/types"
import { ApplicantCard } from "app/core/components/ApplicantCard"
import ApplicantDetailsModal from "app/application/components/ApplicantDetailsModal"
import useStore from "app/core/hooks/useStore"
import { Account } from "app/account/types"
import EndorseModal from "app/core/components/EndorseModal"
import EndorseSuccessModal from "app/core/components/EndorseSuccessModal"
import { Pill } from "app/core/components/Pill"
import getApplicationsByInitiative from "app/application/queries/getApplicationsByInitiative"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Modal from "app/core/components/Modal"
import getRoleByAccountTerminal from "app/role/queries/getRoleByAccountTerminal"
import { Role } from "app/role/types"
import { InviteModal } from "app/application/components/InviteModal"
import getTicket from "app/ticket/queries/getTicket"
import { Ticket } from "app/ticket/types"

const TerminalWaitingPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const { directedFrom } = useRouterQuery()
  const [selectedInitiativeLocalId, setSelectedInitiativeLocalId] = useState<number>()
  const [applications, setApplications] = useState<Application[]>([])
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false)
  const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false)
  const [isEndorseSuccessModalOpen, setIsEndorseSuccessModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application>()
  const [selectedApplicantTicket, setSelectedApplicantTicket] = useState<Ticket | null>()
  const activeUser: Account | null = useStore((state) => state.activeUser)
  const [roleOfActiveUser, setRoleOfActiveUser] = useState<Role | null>()
  const [refreshApplications, setRefreshApplications] = useState<boolean>(false)
  const [firstApplicationRender, setFirstApplicationRender] = useState<boolean>(true)

  useEffect(() => {
    setIsRedirectModalOpen(directedFrom === "application")
  }, [directedFrom])
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const [initiatives] = useQuery(
    getInitiativesByTerminal,
    { terminalId: terminal?.id as number },
    {
      enabled: !!terminal?.id,
      suspense: false,
    }
  )

  useEffect(() => {
    if (firstApplicationRender && Array.isArray(initiatives) && initiatives.length) {
      const firstInitiative = initiatives.find((init) => init.applicationCount !== 0)
      setSelectedInitiativeLocalId(firstInitiative?.localId)
    }
  }, [initiatives])

  const currentInitiative = useMemo(
    () => initiatives?.find((initiative) => initiative.localId === selectedInitiativeLocalId),
    [selectedInitiativeLocalId]
  )

  useEffect(() => {
    if (terminal?.id && selectedApplication?.account?.id) {
      ;(async () => {
        const applicantTicket = await invoke(getTicket, {
          terminalId: terminal.id,
          accountId: selectedApplication?.account?.id as number,
        })
        setSelectedApplicantTicket(applicantTicket)
      })()
    }
  }, [selectedApplication])

  useEffect(() => {
    if (activeUser?.id) {
      ;(async () => {
        const role = await invoke(getRoleByAccountTerminal, {
          terminalId: terminal?.id || 0,
          accountId: activeUser?.id as number,
        })
        setRoleOfActiveUser(role)
      })()
    }
  }, [activeUser?.id])

  const [isApplicantOpen, setIsApplicantOpen] = useState(false)

  useEffect(() => {
    if (selectedInitiativeLocalId) {
      ;(async () => {
        let applications = await invoke(getApplicationsByInitiative, {
          referralGraphAddress: terminal?.data.contracts.addresses.referrals,
          initiativeLocalId: selectedInitiativeLocalId,
          initiativeId: currentInitiative?.id,
          terminalId: terminal?.id,
        })
        setApplications(applications || [])
        setFirstApplicationRender(false)
      })()
    }
  }, [selectedInitiativeLocalId, refreshApplications])

  const applicationCards = applications?.map((application, idx) => {
    const onApplicantCardClick = () => {
      setSelectedApplication(application)
      setIsApplicantOpen(true)
    }

    const applicationCardProps = {
      terminal,
      application,
      onApplicantCardClick,
      roleOfActiveUser,
    }

    return <ApplicantCard key={idx} {...applicationCardProps} />
  })

  const noApplicationsView = selectedInitiativeLocalId && (
    <div>There are no active applications for this initiative.</div>
  )

  const applicationsView =
    !applications || !applications.length ? noApplicationsView : applicationCards

  const initiativePills = initiatives
    // filter out initiatives that don't have applications
    ?.filter((initiative) => initiative?.applicationCount)
    .map((initiative, idx) => {
      return (
        <Pill
          key={idx}
          active={initiative.localId === selectedInitiativeLocalId}
          onClick={() => setSelectedInitiativeLocalId(initiative.localId)}
        >
          {`${initiative.data?.name?.toUpperCase()} (${initiative.applicationCount})`}
        </Pill>
      )
    })

  const waitingRoomView = (
    <>
      <Modal
        open={isRedirectModalOpen}
        toggle={setIsRedirectModalOpen}
        title="You're in the waiting room!"
      >
        <div className="max-w-lg mx-auto">
          <p className="text-marble-white mt-4 text-sm text-center">
            {
              "You're now in the Waiting Room where Station contributors visit, view your profile, and vouch for you. Reach out to the team, get to know them, and start contributing."
            }
          </p>
          <button
            className="rounded bg-magic-mint px-24 py-1 mx-auto block mt-12"
            onClick={() => setIsRedirectModalOpen(false)}
          >
            Continue
          </button>
        </div>
      </Modal>

      {selectedApplication && currentInitiative && (
        <ApplicantDetailsModal
          application={selectedApplication}
          initiative={currentInitiative}
          isApplicantOpen={isApplicantOpen}
          setIsApplicantOpen={setIsApplicantOpen}
          setIsEndorseModalOpen={setIsEndorseModalOpen}
          roleOfActiveUser={roleOfActiveUser?.data?.value}
          setIsInviteModalOpen={setIsInviteModalOpen}
          terminalData={terminal?.data}
        />
      )}
      {selectedInitiativeLocalId && selectedInitiativeLocalId && selectedApplication?.account && (
        <EndorseModal
          isEndorseModalOpen={isEndorseModalOpen}
          setIsEndorseModalOpen={setIsEndorseModalOpen}
          setIsSuccessModalOpen={setIsEndorseSuccessModalOpen}
          selectedUserToEndorse={selectedApplication?.account}
          initiativeLocalId={selectedInitiativeLocalId}
          terminal={terminal}
        />
      )}
      <EndorseSuccessModal
        isSuccessModalOpen={isEndorseSuccessModalOpen}
        setIsSuccessModalOpen={setIsEndorseSuccessModalOpen}
        selectedUserToEndorse={selectedApplication?.account}
      />
      <InviteModal
        selectedApplication={selectedApplication}
        currentInitiative={currentInitiative}
        isInviteModalOpen={isInviteModalOpen}
        setIsInviteModalOpen={setIsInviteModalOpen}
        applicantTicket={selectedApplicantTicket}
        setRefreshApplications={setRefreshApplications}
      />
      <div className="flex flex-col space-y-10">
        {!initiatives ? (
          // skeleton loader pills
          <div className="overflow-x-scroll whitespace-nowrap space-x-3 motion-safe:animate-pulse">
            <div className="inline-block rounded-full border-marble-white bg-gradient-to-r from-concrete to-wet-concrete h-[30px] w-[200px] m-0">
              <span></span>
            </div>
            <div className="inline-block rounded-full border-marble-white bg-gradient-to-r from-concrete to-wet-concrete h-[30px] w-[150px] m-0">
              <span></span>
            </div>
          </div>
        ) : (
          initiatives.filter((initiative) => initiative?.applicationCount).length && (
            <div className="text-marble-white text-sm overflow-x-scroll whitespace-nowrap space-x-3">
              {initiativePills}
            </div>
          )
        )}
        <div className="flex-auto text-marble-white">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {firstApplicationRender
              ? Array.from(Array(9)).map((idx) => (
                  <div
                    key={idx}
                    className="border border-concrete bg-wet-concrete shadow border-solid h-full motion-safe:animate-pulse"
                  >
                    <div className="bg-gradient-to-r from-concrete to-wet-concrete h-[260px]"></div>
                  </div>
                ))
              : applicationsView}
          </div>
        </div>
      </div>
    </>
  )

  return <TerminalNavigation>{waitingRoomView}</TerminalNavigation>
}

TerminalWaitingPage.suppressFirstRenderFlicker = true
TerminalWaitingPage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalWaitingPage
