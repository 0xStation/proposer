import Modal from "../../core/components/Modal"
import { Image, invoke } from "blitz"
import { Dispatch, SetStateAction } from "react"
import { Application } from "app/application/types"
import Exit from "/public/exit-button.svg"
import DiscordIcon from "/public/discord-icon.svg"
import { Account } from "app/account/types"
import { Initiative } from "app/initiative/types"
import { DEFAULT_NUMBER_OF_DECIMALS } from "app/core/utils/constants"
import { useDecimals } from "app/core/contracts/contracts"
import ApplicantEndorsements from "./ApplicantEndorsements"
import useStore from "app/core/hooks/useStore"
import { formatDate } from "app/core/utils/formatDate"
import { ProfileMetadata } from "app/core/components/TalentIdentityUnit/ProfileMetadata"
import { Tag } from "app/core/components/Tag"
import { Button } from "app/core/components/Button"

type ApplicantDetailsModalProps = {
  isApplicantOpen: boolean
  setIsApplicantOpen: Dispatch<SetStateAction<boolean>>
  setIsEndorseModalOpen: Dispatch<SetStateAction<boolean>>
  setIsInviteSuccessModalOpen: Dispatch<SetStateAction<boolean>>
  application: Application
  initiative: Initiative
  roleOfActiveUser?: string
}

const hasBeenAirDroppedTokens = false
const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({
  application,
  initiative,
  isApplicantOpen,
  setIsApplicantOpen,
  setIsEndorseModalOpen,
  setIsInviteSuccessModalOpen,
  roleOfActiveUser,
}) => {
  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const activeUser: Account | null = useStore((state) => state.activeUser)
  const { points = 0 } = application
  const { data: applicantData, address, role, skills } = application?.account || {}
  const { pfpURL, name, ens, pronouns, verified, discordId, timezone } = applicantData
  const profileMetadataProps = {
    pfpURL,
    name,
    ens,
    pronouns,
    verified,
    address,
  }

  const isEndorsable =
    activeUser &&
    (roleOfActiveUser || hasBeenAirDroppedTokens) &&
    activeUser?.address !== application?.account?.address

  const canInvite = roleOfActiveUser === "STAFF"

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
                  <div className="flex flex-row space-x-2 flex-wrap text-marble-white">
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
                <div className="flex flex-col flex-1">
                  <div className="font-bold">
                    <span>Contact</span>
                  </div>
                  <div className="text-sm font-normal flex flex-row space-x-1">
                    <div className="flex content-end">
                      <Image src={DiscordIcon} alt="Discord icon" width={16} height={13} />
                    </div>
                    <div className="text-base font-normal">
                      <span>{discordId}</span>
                    </div>
                  </div>
                </div>
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
              <div className="font-bold">Why {initiative?.data?.name}?</div>
              <div>
                <p className="text-marble-white font-normal text-base">
                  {application?.data?.entryDescription || "N/A"}
                </p>
              </div>
            </div>
            <div id="points and submission" className="flex flex-row flex-auto text-marble-white">
              <div className="flex flex-col flex-1">
                <div className="font-bold">
                  <span>Submission</span>
                </div>
                <div className="text-base font-normal">
                  <div className="flex flex-row max-w-xs break-all mr-2">
                    <a
                      target="_blank"
                      href={application?.data?.url}
                      className="text-magic-mint"
                      rel="noreferrer"
                    >
                      {application?.data?.url}
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex flex-col flex-1">
                {isEndorsable && (
                  <div>
                    <div className="font-bold">
                      <span>Points</span>
                    </div>
                    <div className="text-base font-normal text-marble-white">
                      {`${points * Math.pow(10, 0 - decimals)} RAILⓅ`}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div id="endorsers" className="flex-auto flex flex-col space-y-2">
              <div className="flex-auto text-marble-white font-bold">
                <span>Endorsers</span>
              </div>
              {application?.referrals && application?.referrals.length ? (
                <div className="flex flex-col space-y-1">
                  {application?.referrals?.map?.(({ from: account, amount = 0 }, index) => (
                    <ApplicantEndorsements
                      key={index}
                      endorser={account}
                      amount={amount * Math.pow(10, 0 - decimals)}
                      isEndorsable={isEndorsable || false}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-marble-white text-base">
                  Be the first to endorse this applicant!
                </p>
              )}
            </div>
          </div>
          {isEndorsable && (
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
                    // TODO: @symmetry
                    // invoke(inviteAccountToinitiative, {
                    // applicantId: application?.account?.id,
                    // initiativeId: initiative?.id
                    // })
                    setIsApplicantOpen(false)
                    setTimeout(() => setIsInviteSuccessModalOpen(true), 550)
                  }}
                >
                  Invite to initiative
                </Button>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ApplicantDetailsModal
