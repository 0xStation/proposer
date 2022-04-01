import { Account } from "app/account/types"
import { Tag } from "app/core/components/Tag"
import ProfileMetadata from "app/core/ProfileMetadata"

type ApplicantEndorsementsProps = {
  endorser: Account
  amount: number
  symbol?: string
}

const ApplicantEndorsements: React.FC<ApplicantEndorsementsProps> = ({ endorser, amount }) => {
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
      <div className="flex flex-row border border-concrete space-x-52 p-3">
        <div className="flex flex-col">
          <ProfileMetadata {...profileMetdataProps} />
        </div>
      </div>
    </div>
  )
}

export default ApplicantEndorsements
