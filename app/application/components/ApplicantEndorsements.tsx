import { Account } from "app/account/types"
import { Image } from "blitz"
import Verified from "/public/check-mark.svg"

type ApplicantEndorsementsProps = {
  person: Account
}

const ApplicantEndorsements: React.FC<ApplicantEndorsementsProps> = ({ person }) => {
  return (
    <div>
      <div className="flex-auto border border-concrete">
        <div className="flex flex-row m-3">
          <div className="flex-1 flex flex-row space-x-2">
            <div className="flex-1/3">
              <img
                src={person.data.pfpURL}
                alt="PFP"
                className="h-[38px] w-[38px] border border-marble-white rounded-full"
              />
            </div>
            <div className="flex-2/3 flex flex-col justify-center">
              <div className="flex-1">
                <div className="flex flex-row flex-1 space-x-1">
                  <div className="flex-3/5 text-md font-bold text-marble-white">
                    {person.data.handle}
                  </div>
                  <div className="flex-2/5 m-auto">
                    <Image src={Verified} alt="Verified icon." width={10} height={10} />
                  </div>
                </div>
              </div>
              <div className="flex-1 text-normal text-concrete">
                <div className="flex flex-row flex-1 text-xs text-concrete space-x-1">
                  <div className="flex-1">{person.data.wallet}</div>
                  <div className="flex-1">-</div>
                  <div className="flex-1">{person.data.pronouns}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-1 justify-start">
            <span className="text-concrete text-md text-normal">RAILS</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicantEndorsements
