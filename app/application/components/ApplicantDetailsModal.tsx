import Modal from "../../core/components/Modal"
import Verified from "/public/check-mark.svg"
import { Image } from "blitz"

const ApplicantDetailsModal = ({ applicant, isApplicantOpen, setIsApplicantOpen }) => {
  return (
    <Modal title="" subtitle="" open={isApplicantOpen} toggle={setIsApplicantOpen}>
      <div className="flex flex-col space-y-6">
        <div id="close and meta data" className="flex-auto"></div>
        <div id="pfp and handle" className="flex-auto">
          <div className="flex flex-row flex-1 content-center space-x-1">
            <div className="flex-2/5 content-center align-middle mr-1">
              {applicant?.data.pfpURL ? (
                <div className="flex-2/5 m-auto">
                  <img
                    src={applicant?.data.pfpURL}
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
                <div className="flex-3/5 text-xl text-marble-white">{applicant?.data.handle}</div>
                <div className="flex-2/5 m-auto">
                  <Image src={Verified} alt="Verified icon." width={10} height={10} />
                </div>
              </div>
              <div className="flex flex-row flex-1 text-sm text-concrete space-x-1">
                <div className="flex-1">{applicant?.data.wallet}</div>
                <div className="flex-1">-</div>
                <div className="flex-1">{applicant?.data.pronouns}</div>
              </div>
            </div>
          </div>
        </div>
        <div id="person's details" className="flex-auto flex flex-col text-marble-white space-y-5">
          <div className="flex flex-row flex-auto">
            <div className="flex flex-col flex-1">
              <div className="font-bold">
                <span>Role</span>
              </div>
              <div className="text-sm font-normal">
                {applicant?.data.role ? <span>{applicant.data.role}</span> : <span>N/A</span>}
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="font-bold">
                <span>Skills</span>
              </div>
              <div className="text-sm font-normal">
                <span>N/A</span>
              </div>
            </div>
          </div>
          <div className="flex flex-row flex-auto">
            <div className="flex flex-col flex-1">
              <div className="font-bold">
                <span>Contact</span>
              </div>
              <div className="text-sm font-normal">
                <span>N/A</span>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="font-bold">
                <span>Timezone</span>
              </div>
              <div className="text-sm font-normal">
                <span>N/A</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-auto flex flex-row border border-concrete"></div>
        <div id="applications" className="flex-auto flex flex-row">
          <button className="border border-marble-white h-[29px] rounded-xl bg-marble-white">
            <span className="mx-3 text-concrete text-sm">Newstand</span>
          </button>
        </div>
        <div id="why questions" className="flex-auto flex flex-col text-marble-white space-y-2">
          <div className="font-bold">
            <span>Why Newstand?</span>
          </div>
          <div>
            <p className="text-marble-white font-normal text-sm">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officia
              quibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam
              aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?
            </p>
          </div>
        </div>
        <div id="points and submission" className="flex flex-row flex-auto text-marble-white">
          <div className="flex flex-col flex-1">
            <div className="font-bold">
              <span>Points</span>
            </div>
            <div className="text-sm font-normal">
              <span>RAILS</span>
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <div className="font-bold">
              <span>Submission</span>
            </div>
            <div className="text-sm font-normal">
              <span>links</span>
            </div>
          </div>
        </div>
        <div id="endorsers" className="flex-auto flex flex-col space-y-2">
          <div className="flex-auto text-marble-white font-bold">
            <span>Endorsers</span>
          </div>
          <div className="flex-auto flex flex-row space-x-5">
            <div className="border border-marble-white h-[52px] w-[52px] rounded-full"></div>
            <div className="border border-marble-white h-[52px] w-[52px] rounded-full"></div>
            <div className="border border-marble-white h-[52px] w-[52px] rounded-full"></div>
            <div className="border border-marble-white h-[52px] w-[52px] rounded-full"></div>
          </div>
        </div>
        <div
          id="buttons"
          className="flex-auto flex flex-row content-center justify-center space-x-3"
        >
          <div className="flex-auto flex justify-end">
            <button className="text-black border border-magic-mint h-[29px] w-[215px] bg-magic-mint rounded text-sm font-normal">
              Endorse
            </button>
          </div>
          <div className="flex-auto flex justify-start">
            <button className="text-magic-mint border border-magic-mint h-[29px] w-[190px] rounded text-sm font-normal">
              Invite to Initiative
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ApplicantDetailsModal
