// import { useQuery, BlitzPage, useParam, useRouterQuery, invoke } from "blitz"
// import { useMemo, useState, useEffect } from "react"
// import Layout from "app/core/layouts/Layout"
// import TerminalNavigation from "app/v1/terminal/components/Navigation"
// import getInitiativesByTerminal from "app/v1/initiative/queries/getInitiativesByTerminal"
// import { Application } from "app/v1/application/types"
// import { ApplicantCard } from "app/v1/components/ApplicantCard"
// import ApplicantDetailsModal from "app/v1/application/components/ApplicantDetailsModal"
// import useStore from "app/core/hooks/useStore"
// import EndorseModal from "app/v1/components/EndorseModal"
// import EndorseSuccessModal from "app/v1/components/EndorseSuccessModal"
// import { Pill } from "app/core/components/Pill"
// import getApplicationsByInitiative from "app/v1/application/queries/getApplicationsByInitiative"
// import getTerminalByHandle from "app/v1/terminal/queries/getTerminalByHandle"
// import Modal from "app/core/components/Modal"
// import getRoleByAccountTerminal from "app/role/queries/getRoleByAccountTerminal"
// import { Role } from "app/role/types"
// import { InviteModal } from "app/v1/application/components/InviteModal"
// import getTicket from "app/ticket/queries/getTicket"
// import { Ticket } from "app/ticket/types"
// import { QUERY_PARAMETERS } from "app/core/utils/constants"
// import { Initiative } from "app/v1/initiative/types"
// import hasInvitePermissions from "app/v1/application/queries/hasInvitePermissions"
// import getApplicationByAddress from "app/v1/application/queries/getApplicationByAddress"

// const skeletonLoadingScreen = (
//   <div className="flex flex-col space-y-10">
//     {/* skeleton loader pills */}
//     <div className="overflow-x-scroll whitespace-nowrap space-x-3 motion-safe:animate-pulse">
//       <div className="inline-block rounded-full border-marble-white bg-gradient-to-r from-concrete to-wet-concrete h-[30px] w-[200px] m-0">
//         <span></span>
//       </div>
//       <div className="inline-block rounded-full border-marble-white bg-gradient-to-r from-concrete to-wet-concrete h-[30px] w-[150px] m-0">
//         <span></span>
//       </div>
//     </div>
//     <div className="flex-auto text-marble-white">
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {Array.from(Array(9)).map((idx) => (
//           <div
//             key={idx}
//             className="border border-concrete bg-wet-concrete shadow border-solid h-full motion-safe:animate-pulse"
//           >
//             <div className="bg-gradient-to-r from-concrete to-wet-concrete h-[260px]"></div>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// )

// const TerminalWaitingPage: BlitzPage = () => {
//   const terminalHandle = useParam("terminalHandle") as string
//   const {
//     directedFrom,
//     initiative: initiativeLocalIdParam,
//     applicant: applicantAddressParam,
//   } = useRouterQuery()
//   const [selectedInitiativeLocalId, setSelectedInitiativeLocalId] = useState<number | null>()
//   const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false)
//   const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false)
//   const [isEndorseSuccessModalOpen, setIsEndorseSuccessModalOpen] = useState(false)
//   const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
//   const [selectedApplication, setSelectedApplication] = useState<Application>()
//   const [selectedApplicantTicket, setSelectedApplicantTicket] = useState<Ticket | null>()
//   const activeUser = useStore((state) => state.activeUser)
//   const [roleOfActiveUser, setRoleOfActiveUser] = useState<Role | null>()
//   const [initialPageLoading, setInitialPageLoading] = useState<boolean>(true)
//   const [isApplicantOpen, setIsApplicantOpen] = useState(false)
//   const { DIRECTED_FROM } = QUERY_PARAMETERS
//   const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

//   useEffect(() => {
//     setIsRedirectModalOpen(directedFrom === DIRECTED_FROM.SUBMITTED_APPLICATION)
//   }, [directedFrom])

//   useEffect(() => {
//     if (applicantAddressParam && initiativeLocalIdParam && terminal?.id) {
//       const initiativeLocalId = parseInt(initiativeLocalIdParam as string)
//       ;(async () => {
//         const application = await invoke(getApplicationByAddress, {
//           terminalId: terminal?.id,
//           initiativeLocalId: initiativeLocalId,
//           address: applicantAddressParam,
//         })
//         setSelectedApplication(application as Application)
//         setIsApplicantOpen(true)
//       })()
//     }
//   }, [initiativeLocalIdParam, applicantAddressParam, terminal?.id])

//   const [initiatives] = useQuery(
//     getInitiativesByTerminal,
//     { terminalId: terminal?.id as number },
//     {
//       enabled: !!terminal?.id,
//       suspense: false,
//       onSuccess: (initiatives) => {
//         if (
//           Array.isArray(initiatives) &&
//           initiatives?.filter((initiative) => initiative?.applicationCount).length &&
//           !selectedInitiativeLocalId
//         ) {
//           // set the initiative filter if it's specified in the query param,
//           // otherwise default to the first initiative that has applications
//           let initiativeLocalId = initiativeLocalIdParam
//             ? parseInt(initiativeLocalIdParam as string)
//             : initiatives.find((init) => init.applicationCount !== 0)?.localId
//           setSelectedInitiativeLocalId(initiativeLocalId)
//         } else {
//           setInitialPageLoading(false)
//         }
//       },
//     }
//   )

//   const currentInitiative = useMemo(
//     () => initiatives?.find((initiative) => initiative.localId === selectedInitiativeLocalId),
//     [selectedInitiativeLocalId]
//   )

//   const [canInvite, { refetch: refetchInviteDetails }] = useQuery(
//     hasInvitePermissions,
//     { inviterId: activeUser?.id, terminalId: currentInitiative?.terminalId },
//     {
//       enabled: !!(activeUser?.id && currentInitiative?.terminalId && currentInitiative),
//       suspense: false,
//     }
//   )

//   const [applications, { isLoading: applicationsLoading, refetch: refetchApplications }] = useQuery(
//     getApplicationsByInitiative,
//     {
//       initiativeId: currentInitiative?.id as number,
//       terminalId: terminal?.id as number,
//     },
//     {
//       suspense: false,
//       enabled: !!currentInitiative?.id && !!terminal?.id,
//       onSuccess: () => {
//         setInitialPageLoading(false)
//       },
//     }
//   )

//   useEffect(() => {
//     if (terminal?.id && selectedApplication?.account?.id) {
//       ;(async () => {
//         const applicantTicket = await invoke(getTicket, {
//           terminalId: terminal.id,
//           accountId: selectedApplication.account.id as number,
//         })
//         setSelectedApplicantTicket(applicantTicket)
//       })()
//     }
//   }, [selectedApplication])

//   useEffect(() => {
//     if (activeUser?.id && terminal?.id) {
//       ;(async () => {
//         const role = await invoke(getRoleByAccountTerminal, {
//           terminalId: terminal.id,
//           accountId: activeUser.id as number,
//         })
//         setRoleOfActiveUser(role)
//       })()
//     }
//   }, [activeUser?.id])

//   const applicationCards = applications?.map((application, idx) => {
//     const applicationCardProps = {
//       terminal,
//       application,
//       roleOfActiveUser,
//       initiative: currentInitiative as Initiative,
//       setIsApplicantOpen: setIsApplicantOpen,
//       setIsInviteModalOpen: setIsInviteModalOpen,
//       setIsEndorseModalOpen: setIsEndorseModalOpen,
//       setSelectedApplication: setSelectedApplication,
//       canInvite,
//       isEndorseSuccessModalOpen,
//     }

//     return <ApplicantCard key={idx} {...applicationCardProps} />
//   })

//   const applicationsView =
//     !applications || !applications.length ? (
//       <div>There are no active applications for this initiative.</div>
//     ) : (
//       applicationCards
//     )

//   const waitingRoomView = (
//     <>
//       <Modal
//         open={isRedirectModalOpen}
//         toggle={setIsRedirectModalOpen}
//         title="You're in the waiting room!"
//       >
//         <div className="max-w-lg mx-auto">
//           <p className="text-marble-white mt-4 text-sm text-center">
//             {
//               "You're now in the Waiting Room where Station contributors visit, view your profile, and vouch for you. Reach out to the team, get to know them, and start contributing."
//             }
//           </p>
//           <button
//             className="rounded bg-magic-mint px-24 py-1 mx-auto block mt-12 text-tunnel-black"
//             onClick={() => setIsRedirectModalOpen(false)}
//           >
//             Continue
//           </button>
//         </div>
//       </Modal>
//       {selectedApplication && currentInitiative && (
//         <ApplicantDetailsModal
//           application={selectedApplication}
//           initiative={currentInitiative}
//           isApplicantOpen={isApplicantOpen}
//           setIsApplicantOpen={setIsApplicantOpen}
//           setIsEndorseModalOpen={setIsEndorseModalOpen}
//           roleOfActiveUser={roleOfActiveUser?.data?.value}
//           setIsInviteModalOpen={setIsInviteModalOpen}
//           terminalData={terminal?.data}
//           canInvite={canInvite}
//         />
//       )}
//       {selectedInitiativeLocalId && selectedInitiativeLocalId && selectedApplication?.account && (
//         <EndorseModal
//           isEndorseModalOpen={isEndorseModalOpen}
//           setIsEndorseModalOpen={setIsEndorseModalOpen}
//           setIsSuccessModalOpen={setIsEndorseSuccessModalOpen}
//           selectedUserToEndorse={selectedApplication?.account}
//           initiativeId={currentInitiative?.id}
//           terminal={terminal}
//           refetchApplications={refetchApplications}
//         />
//       )}
//       <EndorseSuccessModal
//         isSuccessModalOpen={isEndorseSuccessModalOpen}
//         setIsSuccessModalOpen={setIsEndorseSuccessModalOpen}
//         selectedUserToEndorse={selectedApplication?.account}
//       />
//       <InviteModal
//         selectedApplication={selectedApplication}
//         currentInitiative={currentInitiative}
//         isInviteModalOpen={isInviteModalOpen}
//         setIsInviteModalOpen={setIsInviteModalOpen}
//         applicantTicket={selectedApplicantTicket}
//         refetchApplications={refetchApplications}
//       />
//       <div className="flex flex-col space-y-10">
//         {initiatives && initiatives?.filter((initiative) => initiative?.applicationCount).length ? (
//           <>
//             <div className="text-marble-white text-sm overflow-x-scroll whitespace-nowrap space-x-3">
//               {initiatives
//                 // filter out initiatives that don't have applications
//                 ?.filter((initiative) => initiative?.applicationCount)
//                 .map((initiative, idx) => {
//                   return (
//                     <Pill
//                       key={idx}
//                       active={initiative.localId === selectedInitiativeLocalId}
//                       onClick={() => {
//                         setSelectedInitiativeLocalId(initiative.localId)
//                         refetchInviteDetails()
//                       }}
//                     >
//                       {`${initiative.data?.name?.toUpperCase()} (${initiative.applicationCount})`}
//                     </Pill>
//                   )
//                 })}
//             </div>
//             <div className="flex-auto text-marble-white">
//               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{applicationsView}</div>
//             </div>
//           </>
//         ) : (
//           <div className="text-marble-white">
//             There are currently no initiatives in the Waiting Room.
//           </div>
//         )}
//       </div>
//     </>
//   )

//   return (
//     <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Waiting Room`}>
//       <TerminalNavigation>
//         {initialPageLoading || applicationsLoading ? skeletonLoadingScreen : waitingRoomView}
//       </TerminalNavigation>
//     </Layout>
//   )
// }

// TerminalWaitingPage.suppressFirstRenderFlicker = true

export const TerminalWaitingPage = () => <div></div>
export default TerminalWaitingPage
