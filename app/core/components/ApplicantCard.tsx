import { Application } from "app/application/types"
import Button from "../components/Button"
import Card from "../components/Card"
import ProfileMetadata from "../ProfileMetadata"
import Tag from "../components/Tag"
import { formatDate } from "../utils/formatDate"
import useStore from "app/core/hooks/useStore"
import { Terminal } from "app/terminal/types"
import { useQuery } from "blitz"
import getEndorsementValueSumByApplication from "app/endorsements/queries/getEndorsementValueSumByApplication"
import { Initiative } from "app/initiative/types"
import getReferralsByApplication from "app/endorsements/queries/getReferralsByApplication"

type ApplicantCardProps = {
  application: Application
  points?: number
  onApplicantCardClick?: (user) => void
  roleOfActiveUser?: any
  terminal?: Terminal | null
  initiative: Initiative
}

export const ApplicantCard = (props: ApplicantCardProps) => {
  const { application, onApplicantCardClick, roleOfActiveUser, terminal, initiative } = props
  const { account: applicant, createdAt } = application
  const pointsSymbol = terminal?.data.contracts.symbols.points

  const [totalEndorsementPoints] = useQuery(getEndorsementValueSumByApplication, {
    initiativeId: initiative?.id,
    endorseeId: applicant?.id,
  })
  const [referrals] = useQuery(getReferralsByApplication, {
    initiativeId: initiative?.id,
    endorseeId: applicant?.id,
  })

  const activeUser = useStore((state) => state.activeUser)

  const canActiveUserEndorse =
    // if active user has a role or they have an endorsement balance (ex: friends of Station)
    // AND they're not endorsing themself, then they are allowed to endorse the applicant.
    !!roleOfActiveUser?.data?.value && applicant?.address !== activeUser?.address

  const {
    address,
    role,
    data: { pfpURL, name, ens, pronouns, verified },
  } = applicant

  const referralPfps = (
    <div className="flex flex-row flex-1 mx-3 my-2">
      <div className="flex-1 items-center justify-center text-base">
        <div className="place-self-center font-bold">Endorsers</div>
      </div>
      <div className="flex flex-1 align-right place-content-end content-right text-base">
        <div className="flex flex-row">
          {referrals?.length
            ? referrals.slice(0, 4).map(({ endorser }, idx) => {
                const pfpStyling = "h-6 w-6 rounded-full border block border-marble-white"
                const nestedStyling = idx ? "ml-[-5px]" : ""
                if (idx === 3) {
                  const additionalReferrals = referrals.length - 3
                  return (
                    <span
                      key={idx}
                      className={`bg-neon-blue text-[10px] text-center items-center ${pfpStyling} ${nestedStyling}`}
                    >
                      {additionalReferrals}+
                    </span>
                  )
                }
                let pfpBubble = endorser?.data?.pfpURL ? (
                  <span
                    key={idx}
                    className={`bg-contain bg-clip-padding ${pfpStyling} ${nestedStyling}`}
                    style={{ backgroundImage: `url(${endorser?.data?.pfpURL})` }}
                  ></span>
                ) : (
                  <span key={idx} className={`bg-concrete ${pfpStyling} ${nestedStyling}`}></span>
                )
                return pfpBubble
              })
            : "N/A"}
        </div>
      </div>
    </div>
  )

  return (
    <Card onClick={onApplicantCardClick}>
      <ProfileMetadata
        {...{ pfpURL, name, ens, pronouns, role, address, verified, className: "mx-3 my-3" }}
      />
      <div className="flex flex-row flex-1 mx-3">
        <div className="flex-1 items-center justify-center text-base">
          <div className="place-self-center mt-1 font-bold">Role</div>
        </div>
        <div className="flex flex-1 align-right place-content-end content-right text-base">
          {role && role !== "N/A" ? (
            <Tag type={"role"}>{role}</Tag>
          ) : (
            <p className="text-marble-white">N/A</p>
          )}
        </div>
      </div>
      {referralPfps}
      <div className="flex flex-row flex-1 mx-3">
        <div className="flex-1 items-center justify-center text-base">
          <div className="place-self-center mt-1 font-bold">Points</div>
        </div>
        {pointsSymbol && (
          <div className="flex flex-1 align-right place-content-end content-right text-base">
            {totalEndorsementPoints ? `${totalEndorsementPoints}` : `0`}
          </div>
        )}
      </div>
      {activeUser && canActiveUserEndorse && onApplicantCardClick && (
        <div className="flex flex-row flex-1 mx-2.5">
          <Button secondary={true} onClick={onApplicantCardClick} className="w-full mt-3">
            Endorse
          </Button>
        </div>
      )}
      <div className="flex flex-row flex-1 mx-3 mt-3.5">
        <div className="flex-1 items-center justify-center text-xs text-concrete">
          {`SUBMITTED ON ${formatDate(createdAt)}`}
        </div>
      </div>
    </Card>
  )
}

export default ApplicantCard
