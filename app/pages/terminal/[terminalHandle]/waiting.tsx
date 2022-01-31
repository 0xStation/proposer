import { useQuery, BlitzPage, useParam, invoke } from "blitz"
import { useMemo, useState, useEffect } from "react"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import { Application } from "app/application/types"
import { TalentIdentityUnit as ApplicationCard } from "app/core/components/TalentIdentityUnit/index"
import { users } from "app/core/utils/data"
import ApplicantDetailsModal from "app/application/components/ApplicantDetailsModal"
import useStore from "app/core/hooks/useStore"
import { useAccount } from "wagmi"
import { Account } from "app/account/types"
import EndorseModal from "app/core/components/EndorseModal"
import SuccessModal from "app/core/components/SuccessModal"
import { Pill } from "app/core/components/Pill"
import getApplicationsByInitiative from "app/application/queries/getApplicationsByInitiative"

const TerminalWaitingPage: BlitzPage = () => {
  const [{ data: accountData }] = useAccount()
  const connectedUser: Account = useMemo(
    () => (accountData?.address ? users[accountData?.address] : null),
    [accountData?.address]
  )
  const terminalHandle = useParam("terminalHandle") as string
  const [selectedInitiative, setSelectedInitiative] = useState<number>()
  const [applications, setApplications] = useState<Application[]>([])
  const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application>()

  const [initiatives] = useQuery(
    getInitiativesByTerminal,
    { terminalHandle: terminalHandle },
    { suspense: false }
  )

  const localIds = {}
  initiatives?.forEach((i) => {
    localIds[i.id] = i.localId
  })

  const [isApplicantOpen, setIsApplicantOpen] = useState(false)
  const activeUser: Account | null = useStore((state) => state.activeUser)

  useEffect(() => {
    if (selectedInitiative) {
      const getApplicationsFromInitiative = async () => {
        let applications = await invoke(getApplicationsByInitiative, {
          referralGraphAddress: "0x7D9D3BE8219069F3a947Fb20bd7b1A6b1944e16E", // todo: dynmically load from local state
          initiativeLocalId: localIds[selectedInitiative],
          initiativeId: selectedInitiative,
        })
        setApplications(applications)
      }
      getApplicationsFromInitiative()
    }
  }, [selectedInitiative])

  const applicationCards = applications?.map((application, idx) => {
    const { applicant, createdAt, points, referrals } = application
    const {
      data: { role, timezone },
    } = applicant
    const onClick = activeUser
      ? () => {
          setSelectedApplication(application)
          setIsApplicantOpen(true)
        }
      : undefined

    const applicationCardProps = {
      user: applicant,
      points,
      onClick,
      dateMetadata: createdAt && {
        createdAt,
        timezone,
      },
    }
    return <ApplicationCard key={idx} {...applicationCardProps} />
  })

  const currentInitiative = initiatives?.find((initiative) => initiative.id === selectedInitiative)

  const applicantDetailsModalView =
    selectedApplication && selectedInitiative && currentInitiative ? (
      <ApplicantDetailsModal
        application={selectedApplication}
        initiative={currentInitiative}
        isApplicantOpen={isApplicantOpen}
        setIsApplicantOpen={setIsApplicantOpen}
        setIsEndorseModalOpen={setIsEndorseModalOpen}
      />
    ) : null

  const endorseModalView = selectedInitiative && localIds[selectedInitiative] && (
    <EndorseModal
      isEndorseModalOpen={isEndorseModalOpen}
      setIsEndorseModalOpen={setIsEndorseModalOpen}
      setIsSuccessModalOpen={setIsSuccessModalOpen}
      selectedUserToEndorse={selectedApplication?.applicant}
      initiativeId={localIds[selectedInitiative]}
    />
  )

  const waitingRoomView =
    !initiatives || (Array.isArray(initiatives) && !initiatives.length) ? (
      <div className="text-marble-white">There are no initiatives in this terminal.</div>
    ) : (
      <>
        {endorseModalView}
        <SuccessModal
          isSuccessModalOpen={isSuccessModalOpen}
          setIsSuccessModalOpen={setIsSuccessModalOpen}
          selectedUserToEndorse={selectedApplication?.applicant}
        />
        {applicantDetailsModalView}
        <div className="flex flex-col space-y-10">
          <div className="flex-auto flex-wrap space-x-3 text-marble-white text-base space-y-3">
            {initiatives.map((initiative, idx) => {
              return (
                <Pill
                  key={idx}
                  active={initiative.localId === selectedInitiative}
                  onClick={() => setSelectedInitiative(initiative.localId)}
                >
                  {initiative.data?.name?.toUpperCase()}
                </Pill>
              )
            })}
          </div>
          <div className="flex-auto text-marble-white">
            {!applications || !applications.length ? (
              <div>
                {selectedInitiative ? (
                  <div>There are no active applications for this initiative.</div>
                ) : (
                  <div>Please select an initiative to view applications.</div>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{applicationCards}</div>
            )}
          </div>
        </div>
      </>
    )

  return <TerminalNavigation>{waitingRoomView}</TerminalNavigation>
}

TerminalWaitingPage.suppressFirstRenderFlicker = true
TerminalWaitingPage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalWaitingPage
