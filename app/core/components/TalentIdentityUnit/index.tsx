import { Account } from "app/account/types"
import Button from "../Button"
import Card from "./Card"
import ProfileMetadata from "./ProfileMetadata"
import RoleTag from "./RoleTag"

type TalentIdentityUnitProps = {
  user: Account
  points?: number
  onClick?: (user) => void
  dateMetadata?: any
}

export const TalentIdentityUnit = (props: TalentIdentityUnitProps) => {
  const { user, points = undefined, onClick, dateMetadata: dateMetadataProp = {} } = props

  const {
    address,
    data: { pfpURL, name, ens, pronouns, role, verified },
  } = user

  const railPoints = typeof points === "number" && (
    <div className="flex flex-row flex-1 mx-3">
      <div className="flex-1 items-center justify-center text-base">
        <div className="place-self-center mt-1 font-bold">Points</div>
      </div>
      <div className="flex flex-1 align-right place-content-end content-right text-base">
        {points} RAIL
      </div>
    </div>
  )

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
        year: "numeric",
        month: "numeric",
        day: "numeric",
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
        <div className="flex-1 items-center justify-center text-base text-concrete">
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
      <div className="flex flex-row flex-1 mx-3 my-2">
        <div className="flex-1 items-center justify-center text-base">
          <div className="place-self-center font-bold">Endorsers</div>
        </div>
        {/* TODO: make endorsers dynamic */}
        <div className="flex flex-1 align-right place-content-end content-right text-base">
          <div className="flex flex-row">
            <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block"></span>
            <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-5px]"></span>
            <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-5px]"></span>
          </div>
        </div>
      </div>
      {railPoints}
      {ctaButton}
      {dateMetadata}
    </Card>
  )
}

export default TalentIdentityUnit
