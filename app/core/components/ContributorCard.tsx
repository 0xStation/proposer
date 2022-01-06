import { users } from "../utils/data"
import Verified from "/public/check-mark.svg"
import { Image } from "blitz"

const person = {
  handle: "fakepixels",
  pfp: "url",
  twitterHandle: "@fakepixels",
  pronouns: "she/her",
  role: "STAFF",
  socials: ["wwww.twitter.com"],
}
const ContributorCard = (contributor) => {
  return (
    <div className="flex flex-col flex-1 content-center text-marble-white border border-marble-white h-[130px]">
      <div className="flex flex-row flex-1 content-center mx-3 my-3 space-x-1">
        <div className="flex-2/5 content-center align-middle">
          <div className="h-[40px] w-[40px] place-self-center border border-marble-white rounded-full place-items-center"></div>
        </div>
        <div className="flex flex-col flex-3/5 content-center">
          <div className="flex flex-row flex-1 space-x-1">
            <div className="flex-3/5 text-m">{person.handle}</div>
            <div className="flex-2/5 m-auto">
              <Image src={Verified} alt="Verified icon." width={10} height={10} />
            </div>
          </div>
          <div className="flex flex-row flex-1 text-xs text-concrete space-x-1">
            <div className="flex-1">{person.twitterHandle}</div>
            <div className="flex-1">-</div>
            <div className="flex-1">{person.pronouns}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-row flex-1 content-center mx-3">
        <div className="flex-1 items-center justify-center text-sm">Role</div>
        <div className="flex-1 text-right text-sm">{person.role}</div>
      </div>
      <div className="flex flex-row flex-1 content-center mx-3">
        <div className="flex-1 items-center justify-center text-sm">Socials</div>
        <div className="flex-1 text-right text-sm">
          <a href={person.socials[0]}>Twitter</a>
        </div>
      </div>
    </div>
  )
}

export default ContributorCard
