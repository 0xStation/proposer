import Modal from "../../core/components/Modal"
import Verified from "/public/check-mark.svg"
import { Image } from "blitz"
import { Dispatch, SetStateAction } from "react"
import { Application } from "app/application/types"
import Exit from "/public/exit-button.svg"
import { Account } from "app/account/types"

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
  return (
    <div>
      <Modal title="applicant" subtitle="" open={isApplicantOpen} toggle={setIsApplicantOpen}>
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
              <span className="text-xs text-concrete font-normal">METADATA</span>
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
              <div className="flex flex-col flex-1">
                <div className="font-bold">
                  <span>Role</span>
                </div>
                <div className="text-sm font-normal">
                  {application?.applicant.data.role ? (
                    <span>{application?.applicant.data.role}</span>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <div className="font-bold">
                  <span>Skills</span>
                </div>
                <div className="text-sm font-normal">
                  <div className="flex flex-row space-x-2 overflow-x-scroll">
                    {application?.data?.skills?.map((skill, index) => {
                      return (
                        <span key={index} className="text-marble-white">
                          {skill}
                        </span>
                      )
                    }) || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row flex-auto">
              <div className="flex flex-col flex-1">
                <div className="font-bold">
                  <span>Contact</span>
                </div>
                <div className="text-sm font-normal">
                  <span>{application?.data?.contact || "N/A"}</span>
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <div className="font-bold">
                  <span>Timezone</span>
                </div>
                <div className="text-sm font-normal">
                  <span>{application?.data?.timezone || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-auto flex flex-row border border-concrete left-0 right-0"></div>
          {/* <div id="applications" className="flex-auto flex flex-row">
            <button className="border border-marble-white h-[29px] rounded-xl bg-marble-white">
              <span className="mx-3 text-concrete text-sm">
                {application?.initiative?.data.name}
              </span>
            </button>
          </div> */}
          <div id="why questions" className="flex-auto flex flex-col text-marble-white space-y-2">
            <div className="font-bold">
              <span>Why {application?.initiative?.data.name}?</span>
            </div>
            <div>
              <p className="text-marble-white font-normal text-sm">
                {application?.data?.why || "N/A"}
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
                  {application?.data?.submission?.map((sub, index) => {
                    return (
                      <a key={index} href={sub} className="text-magic-mint">
                        <span>{sub}</span>
                      </a>
                    )
                  }) || "N/A"}
                </div>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="font-bold">
                <span>Points</span>
              </div>
              <div className="text-sm font-normal">
                <span>RAILS</span>
              </div>
            </div>
          </div>
          <div id="endorsers" className="flex-auto flex flex-col space-y-2">
            <div className="flex-auto text-marble-white font-bold">
              <span>Endorsers</span>
            </div>
            {application?.endorsements && application?.endorsements.length ? (
              <div className="flex-auto">
                {application.endorsements.length > 1 ? (
                  <div className="flex-auto flex flex-row space-x-5">
                    {application.endorsements.map((person, index) => (
                      <div key={index} className="flex flex-col space-y-2 justify-center">
                        <div className="flex-3/5 flex justify-center">
                          <img
                            src={person.data.pfpURL}
                            alt="PFP"
                            className="h-[52px] w-[52px] border border-marble-white rounded-full"
                          />
                        </div>
                        <div className="flex-2/5">
                          <div className="flex flex-1 justify-center">
                            <div className="flex flex-row flex-1 space-x-1">
                              <div className="flex-3/5 text-xs text-marble-white">
                                {person.data.handle}
                              </div>
                              <div className="flex-2/5 m-auto flex justify-center">
                                <Image src={Verified} alt="Verified icon." width={7} height={7} />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-1 justify-center">
                            <span className="text-concrete text-xs text-normal">points</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-auto border border-concrete">
                    <div className="flex flex-row m-3">
                      <div className="flex-1 flex flex-row space-x-2">
                        <div className="flex-1/3">
                          <img
                            src={application.endorsements[0]?.data?.pfpURL}
                            alt="PFP"
                            className="h-[38px] w-[38px] border border-marble-white rounded-full"
                          />
                        </div>
                        <div className="flex-2/3 flex flex-col justify-center">
                          <div className="flex-1">
                            <div className="flex flex-row flex-1 space-x-1">
                              <div className="flex-3/5 text-md font-bold text-marble-white">
                                {application.endorsements[0]?.data?.handle}
                              </div>
                              <div className="flex-2/5 m-auto">
                                <Image src={Verified} alt="Verified icon." width={10} height={10} />
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 text-normal text-concrete">
                            <div className="flex flex-row flex-1 text-xs text-concrete space-x-1">
                              <div className="flex-1">
                                {application.endorsements[0]?.data?.wallet}
                              </div>
                              <div className="flex-1">-</div>
                              <div className="flex-1">
                                {application.endorsements[0]?.data?.pronouns}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-1 justify-start">
                        <span className="text-marble-white text-md text-normal">RAILS</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-auto">
                <span className="text-marble-white font-normal text-sm">
                  Be the first to endorse this applicant!
                </span>
              </div>
            )}
          </div>
          <div id="buttons" className="flex-auto flex flex-row content-center justify-center">
            {activeUser?.address && (
              <div className="flex flex-row space-x-3">
                <div
                  //This is actually supposed to check if the active user is part of the initiative the person applied to
                  className={`"flex-1 flex ${
                    activeUser?.data.role != "N/A" ? "justify-end" : "justify-center"
                  }`}
                >
                  <button className="text-black border border-magic-mint h-[29px] w-[215px] bg-magic-mint rounded text-sm font-normal">
                    Endorse
                  </button>
                </div>
                <div className="flex-1 flex justify-start">
                  <button className="text-magic-mint border border-magic-mint h-[29px] w-[190px] rounded text-sm font-normal">
                    Invite to Initiative
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ApplicantDetailsModal
