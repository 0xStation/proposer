import Modal from "../../core/components/Modal"
import Verified from "/public/check-mark.svg"
import { Image } from "blitz"
import { Dispatch, SetStateAction } from "react"
import { Application } from "app/application/types"
import Exit from "/public/exit-button.svg"
import DiscordIcon from "/public/discord-icon.svg"
import { Account } from "app/account/types"
import { Initiative } from "app/initiative/types"
import { useAccount, useBalance } from "wagmi"
import { TERMINAL, DEFAULT_NUMBER_OF_DECIMALS } from "app/core/utils/constants"
import { useDecimals } from "app/core/contracts/contracts"
import ApplicantEndorsements from "./ApplicantEndorsements"
import useStore from "app/core/hooks/useStore"
import { truncateString } from "app/core/utils/truncateString"

type ApplicantDetailsModalProps = {
  isApplicantOpen: boolean
  setIsApplicantOpen: Dispatch<SetStateAction<boolean>>
  setIsEndorseModalOpen: Dispatch<SetStateAction<boolean>>
  application: Application
  initiative: Initiative
}

const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({
  application,
  initiative,
  isApplicantOpen,
  setIsApplicantOpen,
  setIsEndorseModalOpen,
}) => {
  const activeUser: Account | null = useStore((state) => state.activeUser)
  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const [{ data: balanceData }] = useBalance({
    addressOrName: activeUser?.address,
    token: TERMINAL.TOKEN_ADDRESS,
    watch: true,
    formatUnits: decimals,
  })
  const tokenBalance = parseFloat(balanceData?.formatted || "")

  // this refers to when a contributor applies to another initiative in the same terminal

  const isEndorsable =
    tokenBalance && activeUser && activeUser.address !== application?.applicant?.address

  return (
    <div>
      <Modal subtitle="" open={isApplicantOpen} toggle={setIsApplicantOpen} showTitle={false}>
        <div className="flex flex-col space-y-6">
          <div className="flex flex- auto flex-col space-y-6 overflow-y-scroll h-[585px]">
            <div id="close and meta data" className="flex-auto flex flex-row">
              <div className="flex flex-1 justify-start absolute top-1 left-2">
                <div className="w-[12px] h-[12px]">
                  <button className="text-marble-white" onClick={() => setIsApplicantOpen(false)}>
                    <Image src={Exit} alt="Close button" width={12} height={12} />
                  </button>
                </div>
              </div>
              <div className="flex flex-1 justify-end absolute top-2 right-2 z-50">
                {(application && application.createdAt !== null) || undefined ? (
                  <span className="text-xs text-concrete font-normal">
                    SUBMITTED ON {application.createdAt.toDateString()}
                  </span>
                ) : (
                  <span className="text-xs text-concrete font-normal">SUBMITTED ON ...</span>
                )}
              </div>
            </div>
            <div id="pfp and handle" className="flex-auto">
              <div className="flex flex-row flex-1 content-center space-x-1">
                <div className="flex-2/5 content-center align-middle mr-1">
                  {application?.applicant.data.pfpURL ? (
                    <div className="flex-2/5 m-auto">
                      <img
                        src={application?.applicant.data.pfpURL}
                        alt="PFP"
                        className="h-[52px] w-[52px] border border-marble-white rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="h-[40px] w-[40px] place-self-center border border-marble-white rounded-full place-items-center"></div>
                  )}
                </div>
                <div className="flex flex-col flex-3/5 content-center">
                  <div className="flex flex-row flex-1 space-x-1">
                    <div className="flex-3/5 text-xl text-marble-white">
                      {application?.applicant.data.name}
                    </div>
                    {application?.applicant.data.verified && (
                      <div className="flex-2/5 m-auto">
                        <Image src={Verified} alt="Verified icon." width={10} height={10} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row flex-1 text-base text-concrete space-x-1">
                    <div className="flex-1">
                      {truncateString(
                        application?.applicant.data.ens || application?.applicant.address
                      )}
                    </div>
                    {application?.applicant.data.pronouns && (
                      <div className="flex-1">• {application?.applicant.data.pronouns}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              id="person's details"
              className="flex-auto flex flex-col text-marble-white space-y-5"
            >
              <div className="flex flex-row flex-auto">
                <div className="flex flex-col flex-1 text-marble-white">
                  <div className="font-bold">
                    <span>Role</span>
                  </div>
                  <div className="text-base font-normal flex flex-row">
                    {application?.applicant.data.role ? (
                      <span className="text-base rounded-lg text-eletric-violet bg-[#211831] py-1 px-2">
                        {application?.applicant.data.role.toUpperCase()}
                      </span>
                    ) : (
                      <span>N/A</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="font-bold text-marble-white">
                    <span>Skills</span>
                  </div>
                  <div className="text-base font-normal text-neon-carrot">
                    <div className="flex flex-row space-x-2 overflow-x-scroll text-neon-carrot">
                      {application?.applicant.data.skills.map((skill, index) => {
                        return (
                          <span
                            key={index}
                            className="text-base rounded-lg text-neon-carrot bg-[#302013] py-1 px-2"
                          >
                            {skill.toUpperCase()}
                          </span>
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
                      <span>{application?.applicant?.data?.discordId}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col flex-1 text-marble-white">
                  <div className="font-bold">
                    <span>Timezone</span>
                  </div>
                  <div className="text-base font-normal text-marble-white">
                    <span>{application?.applicant?.data?.timezone || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-auto flex flex-row border border-concrete left-0 right-0 max-h-0">
              {/* <br className="color-concrete"/> */}
            </div>
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
                      <span>{application?.data?.url}</span>
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
                    <div className="text-base font-normal text-concrete">
                      <span>{`${(
                        (application.points as number) / 1000000
                      ).toString()} RAILⒺ`}</span>
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
                //   <div
                //   className={`"flex flex-col space-y-1 ${application.endorsements.length === 1 && "h-[60px]"}
                //    space-y-1 ${
                //      application.endorsements.length > 1 && "h-[100px] overflow-y-scroll"
                //    } overflow-y-scroll"`}
                // >
                <div className="flex flex-col space-y-1">
                  {application.referrals.map(({ from: account, amount }, index) => (
                    <ApplicantEndorsements
                      key={index}
                      person={account}
                      amount={amount}
                      isEndorsable={isEndorsable || false}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex-auto">
                  <span className="text-marble-white font-normal text-base">
                    Be the first to endorse this applicant!
                  </span>
                </div>
              )}
            </div>
          </div>
          {isEndorsable && (
            <div id="buttons" className="flex-auto flex flex-row content-center justify-center">
              <div className="flex flex-row space-x-3">
                <div className={`"flex-1 flex "justify-center"`}>
                  <button
                    onClick={() => {
                      setIsApplicantOpen(false)
                      setIsEndorseModalOpen(true)
                    }}
                    className="text-black border border-magic-mint h-[29px] w-[215px] bg-magic-mint rounded text-base font-normal"
                  >
                    Endorse
                  </button>
                </div>
                {/* The following element is not needed for p0 */}
                {/* <div className="flex-1 flex justify-start">
                  <button className="text-magic-mint border border-magic-mint h-[29px] w-[190px] rounded text-base font-normal">
                    Invite to Initiative
                  </button>
                </div> */}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ApplicantDetailsModal
