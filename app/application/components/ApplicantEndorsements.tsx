import { Account } from "app/account/types"
import ProfileMetadata from "app/core/ProfileMetadata"
import { useRouter } from "blitz"

type ApplicantEndorsementsProps = {
  endorser: Account
  amount: number
  symbol?: string
}

const ApplicantEndorsements: React.FC<ApplicantEndorsementsProps> = ({ endorser, amount }) => {
  const router = useRouter()
  const {
    address,
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
    <div
      tabIndex={0}
      className="flex flex-row border border-concrete space-x-52 p-3 hover:border-marble-white"
      onClick={() => router.push(`/profile/${address}`)}
    >
      <div className="flex flex-col">
        <ProfileMetadata {...profileMetdataProps} />
      </div>
    </div>
  )
}

export default ApplicantEndorsements
