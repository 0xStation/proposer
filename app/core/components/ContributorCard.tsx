import { Dispatch, SetStateAction } from "react"
import Verified from "/public/check-mark.svg"
import { Image } from "blitz"
import Staff from "/public/role-staff.svg"
import Commuter from "/public/role-commuter.svg"
import Visitor from "/public/role-visitor.svg"
import { Account } from "app/account/types"
import { contributors } from "db/seed/contributors"
import EndorseContributorModal from "app/contributors/components/EndorseContributorModal"

function roleSVG(role) {
  let svg
  if (role === "STAFF") {
    svg = Staff
  } else if (role === "COMMUTER") {
    svg = Commuter
  } else if (role === "VISITOR") {
    svg = Visitor
  }
  return svg
}

const ContributorCard = (
  contributor: Account,
  accepted: Boolean,
  endorse: Boolean,
  openEndorseModal?: () => void,
  setSelectedUserToEndorse?: Dispatch<SetStateAction<Account | null>>,
  activeUser?: Account | null
) => {
  const isContributorDirectory = openEndorseModal && setSelectedUserToEndorse
  const isWaitingRoom = !accepted
  return (
    <div
      // className={`flex flex-col flex-none content-center text-marble-white border border-concrete cursor-pointer ${
      //   !isContributorDirectory && "w-[240px] h-[130px]"
      // }`}
      className={`flex flex-col flex-auto content-center ${
        endorse && accepted && "w-[240px]"
      } text-marble-white border border-concrete cursor-pointer ${
        !isWaitingRoom && !isContributorDirectory && "w-[240px] min-h-[180px] max-h-[250px]"
      }`}
      // onClick={() => {
      //   if (!accepted) {
      //     contributor.data.applications
      //   }
      // }}
    >
      <div className="flex flex-row flex-1 content-center mx-3 my-3 space-x-1">
        <div className="flex-2/5 content-center align-middle mr-1">
          {contributor.data.pfpURL ? (
            <div className="flex-2/5 m-auto">
              <img
                src={contributor.data.pfpURL}
                alt="PFP"
                className="h-[40px] w-[40px] border border-marble-white rounded-full"
              />
            </div>
          ) : (
            <div className="h-[40px] w-[40px] place-self-center border border-marble-white rounded-full place-items-center"></div>
          )}
        </div>
        <div className="flex flex-col flex-3/5 content-center">
          <div className="flex flex-row flex-1 space-x-1">
            <div className="flex-3/5 text-m">{contributor.data.handle}</div>
            <div className="flex-2/5 m-auto">
              <Image src={Verified} alt="Verified icon." width={10} height={10} />
            </div>
          </div>
          <div className="flex flex-row flex-1 text-xs text-concrete space-x-1">
            <div className="flex-1">{contributor.data.wallet}</div>
            <div className="flex-1">-</div>
            <div className="flex-1">{contributor.data.pronouns}</div>
          </div>
        </div>
      </div>
      {accepted ? (
        <div>
          <div className="flex flex-row flex-1 mx-3">
            <div className="flex-1 items-center justify-center text-sm">
              <div className="place-self-center mt-2">Role</div>
            </div>

            <div className="flex flex-1 align-right place-content-end content-right text-sm">
              <Image
                className="content-right text-sm"
                src={roleSVG(contributor.data.role)}
                alt="Role icon."
                height={17}
              />
            </div>
          </div>
          <div className="flex flex-row flex-1 mx-3">
            <div className="flex-1 items-center justify-center text-sm">
              <div className="place-self-center mt-2">Endorsers</div>
            </div>

            <div className="flex flex-1 align-right place-content-end content-right text-sm">
              <span>people</span>
            </div>
          </div>
          <div className="flex flex-row flex-1 mx-3 ">
            <div className="flex-1 items-center justify-center text-sm mt-2">Points</div>
            <div className="flex-1 text-right justify-end content-end text-sm">
              <span>number</span>
            </div>
          </div>
          {isContributorDirectory && activeUser?.address !== contributor.address && (
            <div className="flex flex-row align-center justify-center my-2">
              <button
                type="submit"
                className="border-solid border border-magic-mint text-magic-mint hover:bg-concrete w-full mt-0 mb-2 mx-2 rounded"
                onClick={() => {
                  setSelectedUserToEndorse(contributor)
                  openEndorseModal()
                }}
              >
                Endorse
              </button>
            </div>
          )}

          <div className="flex flex-row flex-1 mx-3 ">
            <div className="flex-1 items-center justify-center text-xs text-concrete mt-2">
              Metadata
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-row flex-1 mx-3">
            <div className="flex-1 items-center justify-center text-sm">
              <div className="place-self-center mt-2">Endorsers</div>
            </div>

            <div className="flex flex-1 align-right place-content-end content-right text-sm">
              <span>people</span>
            </div>
          </div>
          <div className="flex flex-row flex-1 mx-3 ">
            <div className="flex-1 items-center justify-center text-sm mt-2">Points</div>
            <div className="flex-1 text-right justify-end content-end text-sm">
              <span>number</span>
            </div>
          </div>
          <div className="flex flex-row flex-1 mx-3">
            <div className="flex-1 items-center justify-center text-sm">
              <div className="place-self-center mt-2">Role</div>
            </div>
            <div className="flex flex-1 align-right place-content-end content-right text-sm">
              <span>N/A</span>
            </div>
          </div>
          {endorse ? (
            <div className="flex flex-row flex-1 align-center justify-center mt-2">
              <button
                type="submit"
                className="border-solid border border-magic-mint text-magic-mint hover:bg-concrete w-full mt-0 mb-2 mx-2 rounded"
                onClick={() => {}}
              >
                Endorse
              </button>
            </div>
          ) : (
            <div></div>
          )}

          {isContributorDirectory && activeUser?.address !== contributor.address && (
            <div className="flex flex-row align-center justify-center my-2">
              <button
                type="submit"
                className="border-solid border border-magic-mint text-magic-mint hover:bg-concrete w-full mt-0 mb-2 mx-2 rounded"
                onClick={() => {
                  setSelectedUserToEndorse(contributor)
                  openEndorseModal()
                }}
              >
                Endorse
              </button>
            </div>
          )}

          <div className="flex flex-row flex-1 mx-3">
            <div className="flex-1 items-center justify-center text-xs text-concrete my-2">
              Metadata
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContributorCard
