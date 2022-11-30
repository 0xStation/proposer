import { Proposal } from "app/proposal/types"
import { useState } from "react"
import { ViewParticipants } from "./ViewParticipants"

export const ParticipantModule = ({
  proposal,
  className = "",
}: {
  proposal?: Proposal
  className: string
}) => {
  const [isView, setIsView] = useState<boolean>(true)

  return isView ? <ViewParticipants proposal={proposal} className={className} /> : <></>
}

export default ParticipantModule
