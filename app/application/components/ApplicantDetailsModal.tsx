import Modal from "../../core/components/Modal"
import { Image, useQuery } from "blitz"
import { Dispatch, SetStateAction } from "react"
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
import hasInvitePermissions from "../queries/hasInvitePermissions"
import { TerminalMetadata } from "app/terminal/types"
import getEndorsementValueSumByApplication from "app/endorsements/queries/getEndorsementValueSumByApplication"
import getReferralsByApplication from "app/endorsements/queries/getReferralsByApplication"

type ApplicantDetailsModalProps = {
  isApplicantOpen: boolean
  setIsApplicantOpen: Dispatch<SetStateAction<boolean>>
  setIsEndorseModalOpen: Dispatch<SetStateAction<boolean>>
  setIsInviteModalOpen: Dispatch<SetStateAction<boolean>>
  application: Application
  initiative: Initiative
  roleOfActiveUser?: string
  terminalData?: TerminalMetadata
}

const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({
  application,
  initiative,
  isApplicantOpen,
  setIsApplicantOpen,
  setIsEndorseModalOpen,
  setIsInviteModalOpen,
  roleOfActiveUser,
  terminalData,
}) => {
  const activeUser = useStore((state) => state.activeUser)
  const { data: applicantData, address, role, skills, id: applicantId } = application?.account || {}
  const { pfpURL, name, ens, pronouns, verified, discordId, timezone, contactURL } = applicantData
  const [canInvite] = useQuery(
    hasInvitePermissions,
    { inviterId: activeUser?.id, terminalId: initiative?.terminalId },
    { enabled: !!(activeUser?.id && initiative?.terminalId), suspense: false }
  )

  const [totalEndorsementPoints] = useQuery(
    getEndorsementValueSumByApplication,
    {
      initiativeId: initiative.id,
      endorseeId: applicantId,
    },
    { suspense: false, enabled: !!(initiative.id && applicantId) }
  )
  const [referrals] = useQuery(getReferralsByApplication, {
    initiativeId: initiative.id,
    endorseeId: applicantId,
  })

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
    activeUser?.address !== application?.account?.address
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
            <div id="pfp and handle" className="flex-auto ">
              <ProfileMetadata {...profileMetadataProps} large />
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
                <div className="flex flex-col flex-1">
                  <div className="font-bold text-marble-white">Skills</div>
                  <div className="flex flex-row flex-wrap text-marble-white">
                    {(skills?.length &&
                      skills?.map?.((skill, index) => {
                        return (
                          <Tag key={index} type="skill">
                            {skill}
                          </Tag>
                        )
                      })) ||
                      "N/A"}
                  </div>
                </div>
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
                <div className="flex flex-col flex-1 text-marble-white">
                  <div className="font-bold">
                    <span>Timezone</span>
                  </div>
                  <div className="text-base font-normal text-marble-white">
                    <span>{timezone ? `GMT ${timezone}` : "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <hr className="border-[.5] border-solid border-concrete mx-[-2rem] my-5" />
            <div
              id="why questions"
              className="flex-auto flex flex-col text-marble-white space-y-2 mt-2"
            >
              <div className="font-bold">
                {initiative.data.applicationQuestion || `Why ${initiative?.data?.name}`}?
              </div>
              <div>
                <p className="text-marble-white font-normal text-base">
                  {application?.data?.entryDescription || "N/A"}
                </p>
              </div>
            </div>
            <div id="points and submission" className="flex flex-row flex-auto text-marble-white">
              {application?.data?.url && (
                <div className="flex flex-col flex-1">
                  <div className="font-bold">
                    <span>Submission</span>
                  </div>
                  <div className="text-base font-normal">
                    <div className="flex flex-row max-w-xs break-all mr-2">
                      <a
                        target="_blank"
                        href={`//${application?.data?.url.replace(/^https?:\/\//, "")}`}
                        className="text-magic-mint"
                        rel="noreferrer"
                      >
                        {application?.data?.url.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {terminalData ? (
                <div className="flex flex-col flex-1">
                  <div>
                    <div className="font-bold">
                      <span>Points</span>
                    </div>
                    <div className="text-base font-normal text-marble-white">
                      {totalEndorsementPoints || "0"}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div id="endorsers" className="flex-auto flex flex-col space-y-2">
              <div className="flex-auto text-marble-white font-bold">
                <span>Endorsers</span>
              </div>
              {referrals?.length ? (
                <div className="flex flex-col space-y-1">
                  {referrals?.map?.(({ endorser: account, endorsementValue }, index) => (
                    <ApplicantEndorsements
                      key={index}
                      endorser={account}
                      amount={endorsementValue || 0}
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
          {canActiveUserEndorse ? (
            <div className="mx-auto">
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
          ) : null}
        </div>
      </Modal>
    </div>
  )
}

export default ApplicantDetailsModal
