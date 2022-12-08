import { ProposalRole, ProposalRoleType } from "@prisma/client"
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
  const [editRoleType, setEditRoleType] = useState<ProposalRoleType>()

  const openEditView = (roleType: ProposalRoleType) => {
    setEditRoleType(roleType)
    setIsView(false)
  }

  const closeEditView = () => {
    setIsView(true)
  }

  return isView ? (
    <ViewRoles proposal={proposal} className={className} openEditView={openEditView} />
  ) : (
    <EditRoles
      proposal={proposal}
      className={className}
      roleType={editRoleType}
      closeEditView={closeEditView}
    />
  )
}

export default RoleModule
