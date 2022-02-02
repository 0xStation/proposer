import { useQuery, BlitzPage, useParam, invoke } from "blitz"
import { useMemo, useState, useEffect } from "react"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import { Application } from "app/application/types"
import { TalentIdentityUnit as ApplicationCard } from "app/core/components/TalentIdentityUnit/index"
import ApplicantDetailsModal from "app/application/components/ApplicantDetailsModal"
import useStore from "app/core/hooks/useStore"
import { Account } from "app/account/types"
import EndorseModal from "app/core/components/EndorseModal"
import SuccessModal from "app/core/components/SuccessModal"
import { Pill } from "app/core/components/Pill"
import getApplicationsByInitiative from "app/application/queries/getApplicationsByInitiative"
import { TERMINAL, DEFAULT_NUMBER_OF_DECIMALS } from "app/core/utils/constants"
import { useDecimals } from "app/core/contracts/contracts"

const hasBeenAirDroppedTokens = false

const TerminalWaitingPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const [selectedInitiativeLocalId, setSelectedInitiativeLocalId] = useState<number>()
  const [applications, setApplications] = useState<Application[]>([])
  const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application>()
  const [initiatives] = useQuery(
    getInitiativesByTerminal,
    { terminalHandle: terminalHandle },
    { suspense: false }
  )

  const currentInitiative = useMemo(
    () => initiatives?.find((initiative) => initiative.localId === selectedInitiativeLocalId),
    [selectedInitiativeLocalId]
  )

  const [isApplicantOpen, setIsApplicantOpen] = useState(false)
  const activeUser: Account | null = useStore((state) => state.activeUser)

  useEffect(() => {
    if (selectedInitiativeLocalId) {
      const getApplicationsFromInitiative = async () => {
        let applications = await invoke(getApplicationsByInitiative, {
          referralGraphAddress: TERMINAL.REFERRAL_GRAPH, // todo: dynmically load from local state
          initiativeLocalId: selectedInitiativeLocalId,
          initiativeId: currentInitiative?.id,
        })
        setApplications(applications || [])
      }
      getApplicationsFromInitiative()
    }
  }, [selectedInitiativeLocalId])

  const applicationCards = applications?.map((application, idx) => {
    const { account, createdAt, points, referrals } = application
    // const {
    //   data: { timezone },
    // } = account
    const onClick = () => {
      setSelectedApplication(application)
      setIsApplicantOpen(true)
    }

    const applicationCardProps = {
      user: account,
      points: points * Math.pow(10, 0 - decimals),
      onClick,
      isEndorsable: !!activeUser?.role || hasBeenAirDroppedTokens,
      referrals,
      dateMetadata: createdAt && {
        createdAt,
      },
    }

    return <ApplicationCard key={idx} {...applicationCardProps} />
  })

  const noApplicationsView = selectedInitiativeLocalId ? (
    <div>There are no active applications for this initiative.</div>
  ) : (
    <div>Please select an initiative to view applications.</div>
  )

  const waitingRoomView =
    !initiatives || (Array.isArray(initiatives) && !initiatives.length) ? (
      <div className="text-marble-white">There are no initiatives in this terminal.</div>
    ) : (
      <>
        {selectedApplication && currentInitiative && (
          <ApplicantDetailsModal
            application={selectedApplication}
            initiative={currentInitiative}
            isApplicantOpen={isApplicantOpen}
            setIsApplicantOpen={setIsApplicantOpen}
            setIsEndorseModalOpen={setIsEndorseModalOpen}
          />
        )}
        {selectedInitiativeLocalId && selectedInitiativeLocalId && (
          <EndorseModal
            isEndorseModalOpen={isEndorseModalOpen}
            setIsEndorseModalOpen={setIsEndorseModalOpen}
            setIsSuccessModalOpen={setIsSuccessModalOpen}
            selectedUserToEndorse={selectedApplication?.account}
            initiativeLocalId={selectedInitiativeLocalId}
          />
        )}
        <SuccessModal
          isSuccessModalOpen={isSuccessModalOpen}
          setIsSuccessModalOpen={setIsSuccessModalOpen}
          selectedUserToEndorse={selectedApplication?.account}
        />
        <div className="flex flex-col space-y-10">
          <div className="flex-auto flex-wrap space-x-3 text-marble-white text-base space-y-3">
            {initiatives
              .filter((initiative) => initiative?.applicationCount) // filter on initiatives with applications
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
              })}
          </div>
          <div className="flex-auto text-marble-white">
            {!applications || !applications.length ? (
              noApplicationsView
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
