import { PencilIcon } from "@heroicons/react/solid"
import {
  AddressType,
  ProposalRoleApprovalStatus,
  ProposalRoleType,
  ProposalStatus,
} from "@prisma/client"
import { AccountPill } from "app/account/components/AccountPill"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import GnosisSafeSignersModal from "app/core/components/GnosisSafeSignersModal"
import { ModuleBox } from "app/core/components/ModuleBox"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import { ToolTip } from "app/core/components/ToolTip"
import useStore from "app/core/hooks/useStore"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { addressRepresentsAccount } from "app/core/utils/addressRepresentsAccount"
import { PROPOSAL_ROLE_APPROVAL_STATUS_MAP } from "app/core/utils/constants"
import { useEffect, useState } from "react"
import { useAccountTags } from "../hooks/useAccountTags"
import { useEditRolesPermissions } from "../hooks/useEditRolesPermissions"
import { useRoles } from "../hooks/useRoles"
import { ProposalRole } from "../types"

const RoleRow = ({ proposal, role, openGnosisSigners, tags = [] }) => {
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
        <div className="flex items-center flex-row space-x-2 h-full">
          {/* ACCOUNT */}
          <AccountPill account={role?.account} />
          {/* TAGS */}
          {tags.map((tag, idx) => (
            <span
              className="bg-wet-concrete rounded-full px-2 py-1 flex items-center w-fit text-xs uppercase text-marble-white font-bold"
              key={`tag-${idx}`}
            >
              {tag}
            </span>
          ))}
        </div>
        {/* APPROVAL */}
        <div className="flex items-center flex-row space-x-4 h-full justify-end">
          {/* MULTISIG PROGRESS */}
          {role?.account?.addressType === AddressType.SAFE &&
            role.approvalStatus !== ProposalRoleApprovalStatus.APPROVED && (
              <div className="group relative">
                <ProgressCircleAndNumber
                  numerator={role.signatures.length}
                  denominator={role.account.data?.quorum}
                />
                <ToolTip className="absolute left w-[150px] right-0">
                  <p
                    className="text-sm text-right text-electric-violet font-bold mt-1 group-hover:cursor-pointer"
                    onClick={() => openGnosisSigners(role)}
                  >
                    See multisig signers
                  </p>
                </ToolTip>
              </div>
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
    </div>
  )
}

export const ViewRoleType = ({ proposal, roleType, openGnosisSigners, className }) => {
  const { roles } = useRoles(proposal?.id)
  const filteredRoles = roles?.filter((role) => role.type === roleType)
  const canEditRole = useEditRolesPermissions(proposal?.id, roleType)

  let { accountTagsMap } = useAccountTags(proposal, filteredRoles, roleType)

  return (
    <>
      {/* TITLE */}
      <h4 className="mt-2 text-xs font-bold text-concrete uppercase">
        {roleType.toLowerCase() + "S"}
      </h4>
      {/* ROLES */}
      {filteredRoles?.map((role, idx) => {
        return (
          <RoleRow
            proposal={proposal}
            role={role}
            openGnosisSigners={openGnosisSigners}
            tags={accountTagsMap[role.address] || []}
            key={idx}
          />
        )
      })}
    </>
  )
}
