import { ProposalRoleType } from "@prisma/client"
import { Proposal } from "app/proposal/types"
import { useState } from "react"
import { EditRoles } from "./EditRoles"
import { ViewRoles } from "./ViewRoles"

export const RoleModule = ({
  proposal,
  className = "",
}: {
  proposal?: Proposal
  className: string
}) => {
  const [isView, setIsView] = useState<boolean>(true)

  return isView ? (
    <ViewRoles proposal={proposal} className={className} setIsView={setIsView} />
  ) : (
    <EditRoles
      proposal={proposal}
      className={className}
      editingRole={ProposalRoleType.CONTRIBUTOR}
      setIsView={setIsView}
    />
  )
}

export default RoleModule
