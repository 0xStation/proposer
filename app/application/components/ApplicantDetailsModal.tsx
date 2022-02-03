import Modal from "../../core/components/Modal"
import Verified from "/public/check-mark.svg"
import { Image } from "blitz"
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
import { RoleTag } from "app/core/components/TalentIdentityUnit/RoleTag"
import { Tag } from "app/core/components/Tag"
import { Button } from "app/core/components/Button"

type ApplicantDetailsModalProps = {
  isApplicantOpen: boolean
  setIsApplicantOpen: Dispatch<SetStateAction<boolean>>
  setIsEndorseModalOpen: Dispatch<SetStateAction<boolean>>
  application: Application
  initiative: Initiative
  roleOfActiveUser?: string
}

const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({
  application,
  initiative,
  isApplicantOpen,
  setIsApplicantOpen,
  setIsEndorseModalOpen,
  roleOfActiveUser,
}) => {
  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const activeUser: Account | null = useStore((state) => state.activeUser)

  const isEndorsable = roleOfActiveUser && activeUser?.address !== application?.account?.address

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

  const { points = 0 } = application
  const { data, address } = application?.account || {}
  const { pfpURL, name, ens, pronouns, verified } = data
  const profileMetadataProps = {
    pfpURL,
    name,
    ens,
    pronouns,
    verified,
    address,
  }

  return (
    <div>
      <Modal subtitle="" open={isApplicantOpen} toggle={setIsApplicantOpen} showTitle={false}>
        <div className="flex flex-col space-y-6">
          <div className="flex flex- auto flex-col space-y-6 overflow-y-scroll h-[585px]">
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
                  <div className="text-base font-normal flex flex-row">
                    <RoleTag role={application?.account?.role} />
                  </div>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="font-bold text-marble-white">Skills</div>
                  <div className="text-base font-normal text-neon-carrot">
                    <div className="flex flex-row space-x-2 flex-wrap text-neon-carrot">
                      {application?.account.data?.skills?.map?.((skill, index) => {
                        return (
                          <Tag key={index} type="skill">
                            {skill}
                          </Tag>
                        )
                      }) || "N/A"}
                    </div>
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
                      <span>{application?.account?.data?.discordId}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col flex-1 text-marble-white">
                  <div className="font-bold">
                    <span>Timezone</span>
                  </div>
                  <div className="text-base font-normal text-marble-white">
                    <span>{application?.account?.data?.timezone || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-auto flex flex-row border border-concrete left-0 right-0 max-h-0"></div>
            <div id="why questions" className="flex-auto flex flex-col text-marble-white space-y-2">
              <div className="font-bold">
                <span>Why {initiative?.data?.name}?</span>
              </div>
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
                  <div className="flex flex-row">
                    <a href={application?.data?.url} className="text-magic-mint">
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
                      {`${points * Math.pow(10, 0 - decimals)} RAIL`}
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
            <div id="buttons" className="flex-auto flex flex-row content-center justify-center">
              <Button
                className="px-28"
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
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ApplicantDetailsModal
