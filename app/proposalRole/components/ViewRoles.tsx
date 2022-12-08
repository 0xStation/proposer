import { PencilIcon } from "@heroicons/react/solid"
import {
  AddressType,
  ProposalRoleApprovalStatus,
  ProposalRoleType,
  ProposalStatus,
} from "@prisma/client"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import GnosisSafeSignersModal from "app/core/components/GnosisSafeSignersModal"
import { ModuleBox } from "app/core/components/ModuleBox"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import useStore from "app/core/hooks/useStore"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { addressRepresentsAccount } from "app/core/utils/addressRepresentsAccount"
import { PROPOSAL_ROLE_APPROVAL_STATUS_MAP } from "app/core/utils/constants"
import { useEffect, useState } from "react"
import { useRoles } from "../hooks/useRoles"
import { ProposalRole } from "../types"

const RoleRow = ({ proposal, role, setSelectedRole }) => {
  const activeUser = useStore((state) => state.activeUser)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)

  const activeUserHasSigned = role.signatures
    ?.filter((signature) => signature?.proposalVersion === proposal?.version)
    .some((signature) => addressesAreEqual(signature.address, activeUser?.address))

  const userRepresentsRole = addressRepresentsAccount(activeUser?.address || "", role?.account)

  const showApproveButton =
    proposal?.status === ProposalStatus.AWAITING_APPROVAL &&
    userRepresentsRole &&
    !activeUserHasSigned

  return (
    <div className="flex flex-col w-full mt-4">
      <div className="flex flex-row w-full items-center justify-between">
        {/* ACCOUNT */}
        <AccountMediaObject account={role?.account} showActionIcons={true} />
        {/* APPROVAL */}
        <div className="flex items-center flex-row space-x-4 h-full justify-end">
          {/* MULTISIG PROGRESS */}
          {role?.account?.addressType === AddressType.SAFE &&
            role.approvalStatus !== ProposalRoleApprovalStatus.APPROVED && (
              <ProgressCircleAndNumber
                numerator={role.signatures.length}
                denominator={role.account.data?.quorum}
              />
            )}
          {/* APPROVE BUTTON */}
          {showApproveButton ? (
            <span
              className="cursor-pointer text-electric-violet font-bold"
              onClick={() => toggleProposalApprovalModalOpen(true)}
            >
              Approve
            </span>
          ) : (
            // STATUS INDICATOR
            <div className="flex flex-row items-center space-x-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  PROPOSAL_ROLE_APPROVAL_STATUS_MAP[role.approvalStatus]?.color
                }`}
              />
              <div className="font-bold text-xs uppercase tracking-wider">
                {PROPOSAL_ROLE_APPROVAL_STATUS_MAP[role.approvalStatus]?.copy}
              </div>
            </div>
          )}
        </div>
      </div>
      {role?.account?.addressType === AddressType.SAFE && (
        <p
          className="text-sm text-electric-violet font-bold mt-1 cursor-pointer"
          onClick={() => setSelectedRole(role)}
        >
          See multisig signers
        </p>
      )}
    </div>
  )
}

const RoleSection = ({ proposal, roles, roleType, setSelectedRole, setIsView }) => {
  return (
    <>
      <div className="w-full flex flex-row justify-between items-center">
        <h4 className="text-xs font-bold text-concrete uppercase">
          {roleType.toLowerCase() + "S"}
        </h4>
        <button onClick={() => setIsView(false)}>
          <PencilIcon className="h-5 w-5 inline text-marble-white cursor-pointer" />
        </button>
      </div>
      {roles
        ?.filter((role) => role.type === roleType)
        ?.map((role, idx) => {
          return (
            <RoleRow proposal={proposal} role={role} setSelectedRole={setSelectedRole} key={idx} />
          )
        })}
    </>
  )
}

export const ViewRoles = ({ proposal, className, setIsView }) => {
  const [selectedRole, setSelectedRole] = useState<ProposalRole | null>()
  const [toggleRoleSigners, setToggleRoleSigners] = useState<boolean>(false)
  const { roles } = useRoles(proposal?.id)

  useEffect(() => {
    if (selectedRole) {
      setToggleRoleSigners(true)
    }
  }, [selectedRole])

  useEffect(() => {
    if (!toggleRoleSigners) {
      setSelectedRole(null)
    }
  }, [toggleRoleSigners])

  return (
    <>
      <GnosisSafeSignersModal
        isOpen={toggleRoleSigners}
        setIsOpen={setToggleRoleSigners}
        role={selectedRole}
      />
      <ModuleBox isLoading={!!roles} className={className}>
        {/* CONTRIBUTORS */}
        <RoleSection
          proposal={proposal}
          roles={roles}
          setSelectedRole={setSelectedRole}
          roleType={ProposalRoleType.CONTRIBUTOR}
          setIsView={setIsView}
        />
        <hr className="w-5/6 text-wet-concrete my-4 mx-auto"></hr>
        {/* CLIENTS */}
        <RoleSection
          proposal={proposal}
          roles={roles}
          setSelectedRole={setSelectedRole}
          roleType={ProposalRoleType.CLIENT}
          setIsView={setIsView}
        />
        <hr className="w-5/6 text-wet-concrete my-4 mx-auto"></hr>
        {/* AUTHORS */}
        <RoleSection
          proposal={proposal}
          roles={roles}
          setSelectedRole={setSelectedRole}
          roleType={ProposalRoleType.AUTHOR}
          setIsView={setIsView}
        />
      </ModuleBox>
    </>
  )
}
