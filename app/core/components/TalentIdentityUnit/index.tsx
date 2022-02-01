import { Account } from "app/account/types"
import { ApplicationReferral } from "app/application/types"
import Button from "../Button"
import Card from "./Card"
import ProfileMetadata from "./ProfileMetadata"
import RoleTag from "./RoleTag"

type TalentIdentityUnitProps = {
  user: Account
  points?: number
  onClick?: (user) => void
  dateMetadata?: any
  isEndorsable?: boolean
  referrals?: ApplicationReferral[]
}

export const TalentIdentityUnit = (props: TalentIdentityUnitProps) => {
  const {
    user,
    points,
    referrals,
    onClick,
    isEndorsable = false,
    dateMetadata: dateMetadataProp = {},
  } = props

  const {
    address,
    data: { pfpURL, name, ens, pronouns, role, verified },
  } = user

  const railPoints = (
    <div className="flex flex-row flex-1 mx-3">
      <div className="flex-1 items-center justify-center text-base">
        <div className="place-self-center mt-1 font-bold">Points</div>
      </div>
      <div className="flex flex-1 align-right place-content-end content-right text-base">
        {points} RAIL
      </div>
    </div>
  )

  const referralPfps = referrals?.length ? (
    <div className="flex flex-row flex-1 mx-3 my-2">
      <div className="flex-1 items-center justify-center text-base">
        <div className="place-self-center font-bold">Endorsers</div>
      </div>
      <div className="flex flex-1 align-right place-content-end content-right text-base">
        <div className="flex flex-row">
          {referrals.slice(0, 4).map(
            (
              {
                from: {
                  data: { pfpURL },
                },
              },
              idx
            ) => {
              const pfpStyling = "h-6 w-6 rounded-full border block border-marble-white"
              const nestedStyling = idx ? "ml-[-5px]" : ""
              let pfpBubble = pfpURL ? (
                <span
                  className={`bg-contain bg-clip-padding ${pfpStyling} ${nestedStyling}`}
                  style={{ backgroundImage: `url(${pfpURL})` }}
                ></span>
              ) : (
                <span className={`bg-concrete ${pfpStyling} ${nestedStyling}`}></span>
              )
              return pfpBubble
            }
          )}
        </div>
      </div>
    </div>
  ) : null

  const ctaButton = onClick ? (
    <div className="flex flex-row flex-1 mx-2.5">
      <Button secondary={true} onClick={onClick} className="w-full mt-3">
        Endorse
      </Button>
    </div>
  ) : null

  let dateMetadata
  let dateMetadataMessage
  if (Object.keys(dateMetadataProp).length) {
    if (dateMetadataProp.joinedAt) {
      const date = dateMetadataProp.joinedAt.toLocaleDateString("en-US", {
        timeZone: dateMetadataProp.timezone,
      })

      dateMetadataMessage = `JOINED SINCE ${date}`
    } else {
      const date = dateMetadataProp.createdAt.toLocaleDateString("en-US", {
        timeZone: dateMetadataProp.timezone,
      })
      dateMetadataMessage = `SUBMITTED ON ${date}`
    }
    dateMetadata = (
      <div className="flex flex-row flex-1 mx-3 mt-3.5">
        <div className="flex-1 items-center justify-center text-xs text-concrete">
          {dateMetadataMessage}
        </div>
      </div>
    )
  }

  return (
    <Card onClick={onClick}>
      <ProfileMetadata {...{ pfpURL, name, ens, pronouns, role, address, verified }} />
      <div className="flex flex-row flex-1 mx-3">
        <div className="flex-1 items-center justify-center text-base">
          <div className="place-self-center mt-1 font-bold">Role</div>
        </div>
        <div className="flex flex-1 align-right place-content-end content-right text-base">
          <RoleTag role={role} />
        </div>
      </div>
      {referralPfps}
      {isEndorsable && railPoints}
      {isEndorsable && ctaButton}
      {dateMetadata}
    </Card>
  )
}

export default TalentIdentityUnit
