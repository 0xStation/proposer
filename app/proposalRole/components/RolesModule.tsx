import { ProposalRole, ProposalRoleType } from "@prisma/client"
import GnosisSafeSignersModal from "app/core/components/GnosisSafeSignersModal"
import { ModuleBox } from "app/core/components/ModuleBox"
import { Proposal } from "app/proposal/types"
import { useState } from "react"
import { useRoles } from "../hooks/useRoles"
import { EditRoles } from "./EditRoles"
import { EditRoleType } from "./EditRoleType"
import { ViewRoles } from "./ViewRoles"
import { ViewRoleType } from "./ViewRoleType"

export const RoleModule = ({
  proposal,
  className = "",
}: {
  proposal?: Proposal
  className: string
}) => {
  // const RoleTypeModule = ({ proposal, roleType, openGnosisSigners, className = "" }) => {
  //   const [isView, setIsView] = useState<boolean>(true)
  //   const closeEditView = () => setIsView(true)
  //   const openEditView = () => setIsView(false)

  //   return isView ? (
  //     <ViewRoleType
  //       proposal={proposal}
  //       roleType={roleType}
  //       className={className}
  //       openGnosisSigners={openGnosisSigners}
  //       openEditView={openEditView}
  //     />
  //   ) : (
  //     <EditRoleType
  //       proposal={proposal}
  //       className={className}
  //       roleType={roleType}
  //       closeEditView={closeEditView}
  //     />
  //   )
  // }

  // const { roles } = useRoles(proposal?.id)
  // const [selectedRole, setSelectedRole] = useState<ProposalRole | null>()
  // const [toggleRoleSigners, setToggleRoleSigners] = useState<boolean>(false)

  // const openGnosisSigners = (role) => {
  //   setSelectedRole(role)
  //   setToggleRoleSigners(true)
  // }

  // return (
  //   <>
  //     <GnosisSafeSignersModal
  //       isOpen={toggleRoleSigners}
  //       setIsOpen={setToggleRoleSigners}
  //       role={selectedRole}
  //     />
  //     <ModuleBox isLoading={!roles} className={className}>
  //       {/* CONTRIBUTORS */}
  //       <RoleTypeModule
  //         proposal={proposal}
  //         roleType={ProposalRoleType.CONTRIBUTOR}
  //         openGnosisSigners={openGnosisSigners}
  //       />
  //       <hr className="w-[90%] text-wet-concrete mt-6 mb-4 mx-auto"></hr>
  //       {/* CLIENTS */}
  //       <RoleTypeModule
  //         proposal={proposal}
  //         roleType={ProposalRoleType.CLIENT}
  //         openGnosisSigners={openGnosisSigners}
  //       />
  //       <hr className="w-[90%] text-wet-concrete mt-6 mb-4 mx-auto"></hr>
  //       {/* AUTHORS */}
  //       <RoleTypeModule
  //         proposal={proposal}
  //         roleType={ProposalRoleType.AUTHOR}
  //         openGnosisSigners={openGnosisSigners}
  //       />
  //     </ModuleBox>
  //   </>
  // )

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
