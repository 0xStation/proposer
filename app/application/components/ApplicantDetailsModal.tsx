import Modal from "../../core/components/Modal"
import { Image, useQuery, useRouter } from "blitz"
import { Dispatch, SetStateAction, useEffect } from "react"
import { Application } from "app/application/types"
import Exit from "/public/exit-button.svg"
import DiscordIcon from "/public/discord-icon.svg"
import { Initiative } from "app/initiative/types"
import ApplicantEndorsements from "./ApplicantEndorsements"
import useStore from "app/core/hooks/useStore"
import { formatDate } from "app/core/utils/formatDate"
import { ProfileMetadata } from "app/core/ProfileMetadata"
import { Tag } from "app/core/components/Tag"
import { Button } from "app/core/components/Button"
import { TerminalMetadata } from "app/terminal/types"
import getReferralsByApplication from "app/endorsements/queries/getReferralsByApplication"
import hasUserEndorsedApplicant from "app/endorsements/queries/hasUserEndorsedApplicant"

type ApplicantDetailsModalProps = {
  isApplicantOpen: boolean
  setIsApplicantOpen: Dispatch<SetStateAction<boolean>>
  setIsEndorseModalOpen: Dispatch<SetStateAction<boolean>>
  setIsInviteModalOpen: Dispatch<SetStateAction<boolean>>
  application: Application
  initiative: Initiative
  roleOfActiveUser?: string
  terminalData?: TerminalMetadata
  canInvite?: boolean
}

const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({
  application,
  initiative,
  isApplicantOpen,
  setIsApplicantOpen,
  setIsEndorseModalOpen,
  setIsInviteModalOpen,
  roleOfActiveUser,
  canInvite = false,
}) => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const shouldRefetchEndorsementPoints = useStore((state) => state.shouldRefetchEndorsementPoints)
  const setShouldRefetchEndorsementPoints = useStore(
    (state) => state.setShouldRefetchEndorsementPoints
  )
  const { data: applicantData, address, role, skills, id: applicantId } = application?.account || {}
  const { pfpURL, name, ens, pronouns, verified, discordId, timezone, contactURL } = applicantData

  const [referrals, { refetch: refetchReferrals }] = useQuery(getReferralsByApplication, {
    initiativeId: initiative.id,
    endorseeId: applicantId,
  })

  const [hasUserAlreadyEndorsedApplicant] = useQuery(
    hasUserEndorsedApplicant,
    {
      initiativeId: initiative?.id,
      endorseeId: applicantId,
      endorserId: activeUser?.id as number,
    },
    { suspense: false, enabled: !!(initiative?.id && applicantId && activeUser?.id) }
  )

  useEffect(() => {
    if (shouldRefetchEndorsementPoints) {
      refetchReferrals()
      setShouldRefetchEndorsementPoints(false)
    }
  }, [shouldRefetchEndorsementPoints])

  const profileMetadataProps = {
    pfpURL,
    name,
    ens,
    pronouns,
    verified,
    address,
  }

  const canActiveUserEndorse = !!(
    activeUser &&
    roleOfActiveUser &&
    activeUser?.address !== application?.account?.address &&
    !hasUserAlreadyEndorsedApplicant
  )

  const CloseButton = ({ onClick }) => (
    <div className="flex flex-1 justify-start absolute top-1 left-2">
      <div className="w-[12px] h-[12px]">
        <button className="text-marble-white" onClick={onClick}>
          <Image src={Exit} alt="Close button" width={12} height={12} />
        </button>
      </div>
    </div>
  )

  const DateMetadata = application?.createdAt ? (
    <p className="text-xs text-concrete font-normal">
      SUBMITTED ON {formatDate(application.createdAt)}
    </p>
  ) : (
    <p className="text-xs text-concrete font-normal">SUBMITTED ON ...</p>
  )

  return (
    <div>
      <Modal subtitle="" open={isApplicantOpen} toggle={setIsApplicantOpen} showTitle={false}>
        <div className="flex flex-col space-y-6">
          <div className="flex flex- auto flex-col space-y-6 overflow-y-scroll overflow-x-hidden h-[585px]">
            <div id="close and meta data" className="flex-auto flex flex-row">
              <CloseButton onClick={() => setIsApplicantOpen(false)} />
              <div className="flex flex-1 justify-end absolute top-2 right-2 z-50">
                {DateMetadata}
              </div>
            </div>
            <div id="pfp and handle" className="flex-row inline-flex justify-between">
              <ProfileMetadata {...profileMetadataProps} large />
              <div className="py-5 flex justify-between align-middle">
                <button
                  className="border rounded border-marble-white text-marble-white px-5 hover:bg-wet-concrete"
                  onClick={() => router.push(`/profile/${address}`)}
                >
                  View Profile
                </button>
              </div>
            </div>
            <div
              id="person's details"
              className="flex-auto flex flex-col text-marble-white space-y-5"
            >
              <div className="flex flex-row flex-auto">
                <div className="flex flex-col flex-1 text-marble-white">
                  <div className="font-bold">Role</div>
                  <div className="text-base font-normal flex flex-row pt-2">
                    {role && role !== "N/A" ? <Tag type="role">{role}</Tag> : "N/A"}
                  </div>
                </div>
                {skills?.length ? (
                  <div className="flex flex-col flex-1">
                    <div className="font-bold text-marble-white">Skills</div>
                    <div className="flex flex-row flex-wrap text-marble-white">
                      {skills?.map?.((skill, index) => {
                        return (
                          <Tag key={index} type="skill">
                            {skill}
                          </Tag>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-row flex-auto text-marble-white">
                {contactURL || discordId ? (
                  <div className="flex flex-col flex-1">
                    <div className="font-bold">
                      <span>Contact</span>
                    </div>
                    {contactURL ? (
                      <div className="text-sm font-normal flex flex-row space-x-1">
                        <div className="text-base font-normal">
                          <a href={contactURL} className="text-magic-mint">
                            {contactURL}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm font-normal flex flex-row space-x-1">
                        <div className="flex content-end">
                          <Image src={DiscordIcon} alt="Discord icon" width={16} height={13} />
                        </div>
                        <div className="text-base font-normal">
                          <span>{discordId}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            <hr className="border-[.5] border-solid border-concrete mx-[-2rem] my-5" />
            <div
              id="why questions"
              className="flex-auto flex flex-col text-marble-white space-y-2 mt-2"
            >
              <div className="font-bold">
                {initiative.data.applicationQuestion ||
                  `What unique value are you looking to bring to ${
                    initiative.data.name || "this initiative"
                  }`}
                ?
              </div>
              <div>
                <p className="text-marble-white font-normal text-base">
                  {application?.data?.entryDescription}
                </p>
              </div>
            </div>
            <div id="points and submission" className="flex flex-row flex-auto text-marble-white">
              {application?.data?.urls && (
                <div className="flex flex-col flex-1">
                  <div className="font-bold">
                    <span>Submission</span>
                  </div>
                  {application.data.urls.map((url, idx) => {
                    return (
                      <div className="text-base font-normal" key={idx}>
                        <div className="flex flex-row max-w-xs break-all mr-2">
                          <a
                            target="_blank"
                            href={`//${url.replace(/^https?:\/\//, "")}`}
                            className="text-magic-mint"
                            rel="noreferrer"
                          >
                            {url.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div id="endorsers" className="flex-auto flex flex-col space-y-2">
              <div className="flex-auto text-marble-white font-bold">
                <span>Endorsers</span>
              </div>
              {referrals?.length ? (
                <div className="flex flex-col space-y-1">
                  {referrals?.map?.(({ endorsementsGiven, endorser }, index) => (
                    <ApplicantEndorsements
                      key={index}
                      endorser={endorser}
                      amount={endorsementsGiven || 0}
                    />
                  ))}
                </div>
              ) : canActiveUserEndorse ? (
                <p className="text-marble-white text-base">
                  Be the first to endorse this applicant!
                </p>
              ) : (
                <p className="text-marble-white text-base">N/A</p>
              )}
            </div>
          </div>
          <div className="mx-auto">
            {canActiveUserEndorse && (
              <Button
                className={canInvite ? "px-20 mr-2 inline" : "px-28"}
                onClick={() => {
                  setIsApplicantOpen(false)
                  // allow time for applicant modal to clean up
                  // before opening the next modal and causing
                  // a memory leak + scroll lock
                  // see https://github.com/tailwindlabs/headlessui/issues/825
                  setTimeout(() => setIsEndorseModalOpen(true), 500)
                }}
              >
                Endorse
              </Button>
            )}
            {canInvite && (
              <Button
                secondary
                className="inline px-6"
                onClick={async () => {
                  setIsApplicantOpen(false)
                  setTimeout(() => setIsInviteModalOpen(true), 550)
                }}
              >
                Add to Initiative
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ApplicantDetailsModal
