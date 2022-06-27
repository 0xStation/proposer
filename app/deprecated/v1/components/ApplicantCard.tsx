// import { Dispatch, SetStateAction, useEffect } from "react"
// import { Application } from "app/v1/application/types"
// import ProfileMetadata from "../../core/ProfileMetadata"
// import Tag from "../../core/components/Tag"
// import { formatDate } from "../../core/utils/formatDate"
// import useStore from "app/core/hooks/useStore"
// import { Terminal } from "app/v1/terminal/types"
// import { useQuery, useRouter } from "blitz"
// import { Initiative } from "app/v1/initiative/types"
// import getReferralsByApplication from "app/v1/endorsements/queries/getReferralsByApplication"
// import hasUserEndorsedApplicant from "app/v1/endorsements/queries/hasUserEndorsedApplicant"

// type ApplicantCardProps = {
//   application: Application
//   points?: number
//   roleOfActiveUser?: any
//   terminal?: Terminal | null
//   initiative: Initiative
//   setIsApplicantOpen: Dispatch<SetStateAction<boolean>>
//   setIsInviteModalOpen: Dispatch<SetStateAction<boolean>>
//   setIsEndorseModalOpen: Dispatch<SetStateAction<boolean>>
//   setSelectedApplication: Dispatch<SetStateAction<Application>>
//   canInvite?: boolean
//   isEndorseSuccessModalOpen?: boolean
// }

// export const ApplicantCard = (props: ApplicantCardProps) => {
//   const hoverButtonStyling =
//     "bg-tunnel-black text-electric-violet rounded w-40 border border-electric-violet hover:bg-wet-concrete p-1"
//   const {
//     application,
//     roleOfActiveUser,
//     initiative,
//     setIsInviteModalOpen,
//     setIsEndorseModalOpen,
//     setIsApplicantOpen,
//     setSelectedApplication,
//     canInvite = false,
//     isEndorseSuccessModalOpen,
//   } = props
//   const { account: applicant, createdAt } = application
//   const router = useRouter()
//   const [referrals] = useQuery(
//     getReferralsByApplication,
//     {
//       initiativeId: initiative?.id,
//       endorseeId: applicant?.id,
//     },
//     {
//       suspense: false,
//       enabled: !!(initiative?.id && applicant?.id),
//     }
//   )

//   const activeUser = useStore((state) => state.activeUser)

//   const [hasUserAlreadyEndorsedApplicant, { refetch: refetchHasUserAlreadyEndorsed }] = useQuery(
//     hasUserEndorsedApplicant,
//     {
//       initiativeId: initiative?.id,
//       endorseeId: applicant?.id,
//       endorserId: activeUser?.id as number,
//     },
//     {
//       suspense: false,
//       enabled: !!(initiative?.id && applicant?.id && activeUser?.id),
//     }
//   )

//   useEffect(() => {
//     // If the endorse success modal is open, that means the user has already
//     // endorsed the applicant. Therefore, we want to use this state to refetch
//     // the correct endorsement permissions and hide the endorse button on hover.
//     refetchHasUserAlreadyEndorsed()
//   }, [isEndorseSuccessModalOpen])

//   const canActiveUserEndorse =
//     // if active user has a role or they have an endorsement balance (ex: friends of Station)
//     // AND they're not endorsing themself, then they are allowed to endorse the applicant.
//     !!roleOfActiveUser?.data?.value && applicant?.address !== activeUser?.address

//   const {
//     address,
//     role,
//     data: { pfpURL, name, ens, pronouns, verified },
//   } = applicant

//   const referralPfps = (
//     <div className="flex flex-row flex-1 mx-3 my-2">
//       <div className="flex-1 items-center justify-center text-base">
//         <div className="place-self-center font-bold">Endorsers</div>
//       </div>
//       <div className="flex flex-1 align-right place-content-end content-right text-base">
//         <div className="flex flex-row">
//           {referrals?.length
//             ? referrals.slice(0, 4).map(({ endorser }, idx) => {
//                 const pfpStyling = "h-6 w-6 rounded-full border block border-marble-white"
//                 const nestedStyling = idx ? "ml-[-5px]" : ""
//                 if (idx === 3) {
//                   const additionalReferrals = referrals.length - 3
//                   return (
//                     <span
//                       key={idx}
//                       className={`bg-neon-blue text-[10px] text-center items-center ${pfpStyling} ${nestedStyling}`}
//                     >
//                       {additionalReferrals}+
//                     </span>
//                   )
//                 }
//                 let pfpBubble = endorser?.data?.pfpURL ? (
//                   <span
//                     key={idx}
//                     className={`bg-contain bg-clip-padding ${pfpStyling} ${nestedStyling}`}
//                     style={{ backgroundImage: `url(${endorser?.data?.pfpURL})` }}
//                   ></span>
//                 ) : (
//                   <span key={idx} className={`bg-concrete ${pfpStyling} ${nestedStyling}`}></span>
//                 )
//                 return pfpBubble
//               })
//             : "N/A"}
//         </div>
//       </div>
//     </div>
//   )

//   const handleViewApplicationClick = (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setSelectedApplication(application)
//     // replace query params with applicant details
//     // `shallow` will update the route without refetching data for the page.
//     // https://nextjs.org/docs/routing/shallow-routing
//     router.push(
//       `${window.location.pathname}/?applicant=${applicant.address}&initiative=${initiative.localId}`,
//       undefined,
//       { shallow: true }
//     )
//     setIsApplicantOpen(true)
//   }

//   return (
//     <div
//       className="border border-concrete p-1 pb-3 flex flex-col cursor-pointer h-full hover:border-marble-white relative group"
//       onClick={handleViewApplicationClick}
//     >
//       <>
//         <div className="absolute h-full w-full bg-tunnel-black opacity-80 top-0 left-0 hidden group-hover:block"></div>
//         <div className="absolute h-full w-full top-0 left-0 flex-col items-center justify-center space-y-2 hidden group-hover:flex">
//           {activeUser && canActiveUserEndorse && !hasUserAlreadyEndorsedApplicant && (
//             <button
//               className={hoverButtonStyling}
//               onClick={(e) => {
//                 e.preventDefault()
//                 e.stopPropagation()
//                 setSelectedApplication(application)
//                 setIsEndorseModalOpen(true)
//               }}
//             >
//               Endorse
//             </button>
//           )}
//           {canInvite && activeUser?.address !== address && (
//             <button
//               className={hoverButtonStyling}
//               onClick={(e) => {
//                 e.preventDefault()
//                 e.stopPropagation()
//                 setSelectedApplication(application)
//                 setIsInviteModalOpen(true)
//               }}
//             >
//               Add to Terminal
//             </button>
//           )}
//           <button className={hoverButtonStyling} onClick={handleViewApplicationClick}>
//             View
//           </button>
//         </div>
//       </>
//       <ProfileMetadata
//         {...{ pfpURL, name, ens, pronouns, role, address, verified, className: "mx-3 my-3" }}
//       />
//       <div className="flex flex-row flex-1 mx-3">
//         <div className="flex-1 items-center justify-center text-base">
//           <div className="place-self-center mt-1 font-bold">Role</div>
//         </div>
//         <div className="flex flex-1 align-right place-content-end content-right text-base">
//           {role && role !== "N/A" ? (
//             <Tag type={"role"}>{role}</Tag>
//           ) : (
//             <p className="text-marble-white">N/A</p>
//           )}
//         </div>
//       </div>
//       {referralPfps}
//       <div className="flex flex-row flex-1 mx-3 mt-3.5">
//         <div className="flex-1 items-center justify-center text-xs text-concrete">
//           {`SUBMITTED ON ${formatDate(createdAt)}`}
//         </div>
//       </div>
//     </div>
//   )
// }

export const ApplicantCard = () => <div></div>
export default ApplicantCard
