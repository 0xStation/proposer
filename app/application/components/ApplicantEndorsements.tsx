import { Account } from "app/account/types"
import { Image } from "blitz"
import Verified from "/public/check-mark.svg"
import { truncateString } from "app/core/utils/truncateString"
import { Tag } from "app/core/components/Tag"
import ProfileMetadata from "app/core/components/TalentIdentityUnit/ProfileMetadata"

type ApplicantEndorsementsProps = {
  endorser: Account
  amount: number
  isEndorsable?: boolean
}

const ApplicantEndorsements: React.FC<ApplicantEndorsementsProps> = ({
  endorser,
  amount,
  isEndorsable,
}) => {
  const {
    address,
    role,
    data: { pfpURL, name, ens, pronouns, verified },
  } = endorser

  const profileMetdataProps = {
    pfpURL,
    address,
    name,
    ens,
    pronouns,
    verified,
  }
  return (
    <div>
      <div className="flex-auto border border-concrete">
        <div className="grid grid-cols-3 p-3">
          <div className="flex flex-col">
            <ProfileMetadata {...profileMetdataProps} />
          </div>
          <div className="flex flex-col pt-3">
            {role != "N/A" && <Tag type="role">{role?.toUpperCase()}</Tag>}
          </div>
          <div className="flex flex-col ">
            {isEndorsable && (
              <span className="text-marble-white text-lg text-normal m-2">{`${amount} RAIL`}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicantEndorsements
