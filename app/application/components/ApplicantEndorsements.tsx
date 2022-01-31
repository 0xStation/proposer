import { Account } from "app/account/types"
import { Image } from "blitz"
import Verified from "/public/check-mark.svg"

type ApplicantEndorsementsProps = {
  person: Account
  amount: number
  isEndorsable?: boolean
}

const ApplicantEndorsements: React.FC<ApplicantEndorsementsProps> = ({
  person,
  amount,
  isEndorsable,
}) => {
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
                  <div className="flex-3/5 text-lg font-bold text-marble-white">
                    {person.data.handle}
                  </div>
                  <div className="flex-2/5 m-auto">
                    <Image src={Verified} alt="Verified icon." width={10} height={10} />
                  </div>
                </div>
              </div>
              <div className="flex-1 text-normal text-concrete">
                <div className="flex flex-row flex-1 text-base text-concrete space-x-1">
                  <div className="flex-1">{person.data.wallet}</div>
                  <div className="flex-1">-</div>
                  <div className="flex-1">{person.data.pronouns}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-1 justify-center content-center">
            {person && (
              <span className="text-xs rounded-lg text-electric-violet bg-[#211831] py-1 m-2 px-2">
                {person.data.role?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-1 content-center justify-center">
            {isEndorsable && (
              <span className="text-concrete text-lg text-normal m-2">{`${amount} RAILⒺ`}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicantEndorsements
