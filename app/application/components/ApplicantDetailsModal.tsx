import Modal from "../../core/components/Modal"
import Verified from "/public/check-mark.svg"
import { Image } from "blitz"
import { Dispatch, SetStateAction } from "react"
import { Application } from "app/application/types"
import Exit from "/public/exit-button.svg"
import { Account } from "app/account/types"
import { useAccount, useBalance } from "wagmi"
import { TERMINAL, DEFAULT_NUMBER_OF_DECIMALS } from "app/core/utils/constants"
import { useDecimals } from "app/core/contracts/contracts"
import ApplicantEndorsements from "./ApplicantEndorsements"

type ApplicantDetailsModalProps = {
  isApplicantOpen: boolean
  setIsApplicantOpen: Dispatch<SetStateAction<boolean>>
  application?: Application
  activeUser?: Account
}

const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({
  application,
  isApplicantOpen,
  setIsApplicantOpen,
  activeUser,
}) => {
  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const [{ data: balanceData }] = useBalance({
    addressOrName: activeUser?.address,
    token: TERMINAL.TOKEN_ADDRESS,
    watch: true,
    formatUnits: decimals,
  })
  const tokenBalance = parseFloat(balanceData?.formatted || "")

  // this refers to when a contributor applies to another initiative in the same terminal

  // const isEndorsable =
  //   tokenBalance && activeUser && activeUser.address !== application?.applicant?.address
  //using this instead of the check above since it renders the component faster
  let endorable
  const isEndorsable = () => {
    if (activeUser === null || activeUser === undefined) {
      endorable = false
      return false
    } else if (activeUser.address === application?.applicant?.address) {
      endorable = false
      return false
    } else if (!tokenBalance) {
      endorable = false
      return false
    } else {
      endorable = true
      return true
    }
  }

  return (
    <div>
      <Modal subtitle="" open={isApplicantOpen} toggle={setIsApplicantOpen} showTitle={false}>
        <div className="flex flex-col space-y-6">
          <div id="close and meta data" className="flex-auto flex flex-row">
            <div className="flex flex-1 justify-start absolute top-2 left-2">
              <div className="w-[12px] h-[12px]">
                <button className="text-marble-white" onClick={() => setIsApplicantOpen(false)}>
                  <Image src={Exit} alt="Close button" width={12} height={12} />
                </button>
              </div>
            </div>
            <div className="flex flex-1 justify-end absolute top-2 right-2 z-50">
              {(application && application.createdAt !== null) || undefined ? (
                <span className="text-xs text-concrete font-normal">
                  {application?.createdAt.toDateString}
                </span>
              ) : (
                <span className="text-xs text-concrete font-normal">Metadata</span>
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
                    {application?.applicant.data.handle}
                  </div>
                  <div className="flex-2/5 m-auto">
                    <Image src={Verified} alt="Verified icon." width={10} height={10} />
                  </div>
                </div>
                <div className="flex flex-row flex-1 text-sm text-concrete space-x-1">
                  <div className="flex-1">{application?.applicant.data.wallet}</div>
                  <div className="flex-1">-</div>
                  <div className="flex-1">{application?.applicant.data.pronouns}</div>
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
                <div className="text-xs font-normal flex flex-row">
                  {application?.applicant.data.role ? (
                    <span className="text-xs rounded-lg text-eletric-violet bg-[#211831] py-1 px-2">
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
                <div className="text-sm font-normal text-neon-carrot">
                  <div className="flex flex-row space-x-2 overflow-x-scroll text-neon-carrot">
                    {application?.applicant.data.skills.map((skill, index) => {
                      return (
                        <span
                          key={index}
                          className="text-xs rounded-lg text-neon-carrot bg-[#302013] py-1 px-2"
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
                <div className="text-sm font-normal">
                  <span>@{application?.applicant.data.discordId}</span>
                </div>
              </div>
              <div className="flex flex-col flex-1 text-marble-white">
                <div className="font-bold">
                  <span>Timezone</span>
                </div>
                <div className="text-sm font-normal text-marble-white">
                  <span>{application?.applicant.data.timezone || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-auto flex flex-row border border-concrete left-0 right-0"></div>
          <div id="why questions" className="flex-auto flex flex-col text-marble-white space-y-2">
            <div className="font-bold">
              <span>Why {application?.initiative?.data.name}?</span>
            </div>
            <div>
              <p className="text-marble-white font-normal text-sm">
                {application?.data?.entryDesription || "N/A"}
              </p>
            </div>
          </div>
          <div id="points and submission" className="flex flex-row flex-auto text-marble-white">
            <div className="flex flex-col flex-1">
              <div className="font-bold">
                <span>Submission</span>
              </div>
              <div className="text-sm font-normal">
                <div className="flex flex-row">
                  <a href={application?.data?.url} className="text-magic-mint">
                    <span>{application?.data?.url}</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              {isEndorsable() && (
                <div>
                  <div className="font-bold">
                    <span>Points</span>
                  </div>
                  <div className="text-sm font-normal text-concrete">
                    <span>RAILS</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div id="endorsers" className="flex-auto flex flex-col space-y-2">
            <div className="flex-auto text-marble-white font-bold">
              <span>Endorsers</span>
            </div>
            {application?.endorsements && application?.endorsements.length ? (
              <div
                className={`"flex flex-col ${application.endorsements.length === 1 && "h-[60px]"}
                 space-y-1 ${
                   application.endorsements.length > 1 && "h-[100px] overflow-y-scroll"
                 } overflow-y-scroll"`}
              >
                {application.endorsements.map((person, index) => (
                  <ApplicantEndorsements key={index} person={person} isEndorsable={endorable} />
                ))}
              </div>
            ) : (
              <div className="flex-auto">
                <span className="text-marble-white font-normal text-sm">
                  Be the first to endorse this applicant!
                </span>
              </div>
            )}
          </div>
          {isEndorsable() && (
            <div id="buttons" className="flex-auto flex flex-row content-center justify-center">
              <div className="flex flex-row space-x-3">
                <div className={`"flex-1 flex "justify-center"`}>
                  <button className="text-black border border-magic-mint h-[29px] w-[215px] bg-magic-mint rounded text-sm font-normal">
                    Endorse
                  </button>
                </div>
                {/* The following element is not needed for p0 */}
                {/* <div className="flex-1 flex justify-start">
                  <button className="text-magic-mint border border-magic-mint h-[29px] w-[190px] rounded text-sm font-normal">
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
