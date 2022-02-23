import { Account } from "app/account/types"
import { Tag } from "app/core/components/Tag"
import ProfileMetadata from "app/core/ProfileMetadata"

type ApplicantEndorsementsProps = {
  endorser: Account
  amount: number
  isEndorsable?: boolean
  symbol?: string
}

const ApplicantEndorsements: React.FC<ApplicantEndorsementsProps> = ({
  endorser,
  amount,
  symbol,
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
            {role && role !== "N/A" && <Tag type="role">{role?.toUpperCase()}</Tag>}
          </div>
          <div className="flex flex-col ">
            <span className="text-marble-white text-lg text-normal m-2 justify-center">{`${amount} ${symbol}`}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicantEndorsements
