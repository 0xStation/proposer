import { Dispatch, SetStateAction } from "react"
import Verified from "/public/check-mark.svg"
import { Image } from "blitz"
import Staff from "/public/role-staff.svg"
import Commuter from "/public/role-commuter.svg"
import Visitor from "/public/role-visitor.svg"
import TwitterIcon from "/public/twitter-icon.svg"
import { Account } from "app/account/types"

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
  openEndorseModal?: () => void,
  setSelectedUserToEndorse?: Dispatch<SetStateAction<Account | null>>
) => {
  return (
    <div className="flex flex-col flex-1 content-center text-marble-white border border-concrete h-[180px] cursor-pointer">
      <div className="flex flex-row flex-1 content-center mx-3 my-3 space-x-1">
        <div className="flex-2/5 content-center align-middle">
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
          <div className="flex flex-row flex-1 text-xs text-concrete space-x-1">
            <div className="flex-1">{contributor.data.wallet}</div>
            <div className="flex-1">-</div>
            <div className="flex-1">{contributor.data.pronouns}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-row flex-1 mx-3">
        <div className="flex-1 items-center justify-center text-sm">
          <div className="place-self-center mt-2">Role</div>
        </div>
        {contributor.data.role && (
          <div className="flex flex-1 align-right place-content-end content-right text-sm">
            <Image
              className="content-right text-sm"
              src={roleSVG(contributor.data.role)}
              alt="Role icon."
              height={17}
            />
            {/* <span className="p-1 rounded-lg bg-purple-300 text-purple-500">{contributor.data.role}</span> */}
          </div>
        )}
      </div>
      <div className="flex flex-row flex-1 mx-3 ">
        <div className="flex-1 items-center justify-center text-sm">Socials</div>
        <div className="flex-1 text-right justify-end content-end text-sm">
          <a target="_blank" rel="noreferrer" href={contributor.data.twitterURL}>
            <Image
              className="content-right text-sm"
              src={TwitterIcon}
              alt="Role icon."
              height={15}
            />
          </a>
        </div>
      </div>
      {openEndorseModal && setSelectedUserToEndorse && (
        <div className="flex flex-row align-center justify-center">
          <button
            type="submit"
            className="border-solid border border-magic-mint text-magic-mint w-full mt-0 mb-2 mx-2 rounded"
            onClick={() => {
              setSelectedUserToEndorse(contributor)
              openEndorseModal()
            }}
          >
            Endorse
          </button>
        </div>
      )}
    </div>
  )
}

export default ContributorCard
