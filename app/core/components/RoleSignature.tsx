import { useState } from "react"
import useStore from "../hooks/useStore"
import { addressesAreEqual } from "../utils/addressesAreEqual"
import { PROPOSAL_ROLE_APPROVAL_STATUS_MAP } from "../utils/constants"
import AccountMediaObject from "./AccountMediaObject"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import truncateString from "app/core/utils/truncateString"
import {
  AddressType,
  ProposalRoleType,
  ProposalSignatureType,
  ProposalStatus,
} from "@prisma/client"

const SafeRole = ({ role, proposal }) => {
  const activeUser = useStore((state) => state.activeUser)
  const [toggleSigners, setToggleSigners] = useState<boolean>(false)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)

  const activeUserHasSigned = role.signatures
    ?.filter((signature) => signature?.proposalVersion === proposal?.version)
    .some((signature) => addressesAreEqual(signature.address, activeUser?.address))
  const activeUserHasAProposalRole = role.account.data?.signers?.some((signer) =>
    addressesAreEqual(signer, activeUser?.address)
  )

  const showSignButton =
    proposal?.status !== ProposalStatus.DRAFT && activeUserHasAProposalRole && !activeUserHasSigned

  const totalSafeSignersSigned = role.signatures.filter((signature) => {
    return (
      signature.proposalVersion === proposal?.version &&
      role.account.data?.signers?.some((signer) => {
        return (
          addressesAreEqual(signature.address, signer) &&
          signature.type === ProposalSignatureType.APPROVE // only count APPROVE signatures to ignore author's SEND signature
        )
      })
    )
  }).length

  const showStatus =
    proposal?.status !== ProposalStatus.DRAFT || role.type === ProposalRoleType.AUTHOR

  return (
    <>
      <div className="flex flex-row w-full items-center justify-between">
        {role ? (
          <div className="flex flex-col w-full">
            <div className="flex flex-row w-full items-center justify-between">
              <AccountMediaObject account={role?.account} showActionIcons={true} />
              <div className="flex flex-col items-end space-y-1">
                {showSignButton ? (
                  <span
                    className="text-electric-violet cursor-pointer"
                    onClick={() => toggleProposalApprovalModalOpen(true)}
                  >
                    Approve
                  </span>
                ) : showStatus ? (
                  <div className="flex flex-row items-center space-x-1">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        PROPOSAL_ROLE_APPROVAL_STATUS_MAP[role?.approvalStatus]?.color
                      }`}
                    />

                    <div className="font-bold text-xs uppercase tracking-wider">
                      {PROPOSAL_ROLE_APPROVAL_STATUS_MAP[role?.approvalStatus]?.copy}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                <ProgressCircleAndNumber
                  numerator={
                    totalSafeSignersSigned > role.account.data?.quorum
                      ? role.account.data?.quorum
                      : totalSafeSignersSigned
                  }
                  denominator={role.account.data?.quorum}
                />
              </div>
            </div>
            <p
              className="text-sm text-electric-violet font-bold mt-1 cursor-pointer"
              onClick={() => setToggleSigners(!toggleSigners)}
            >
              See multisig signers
            </p>
            {toggleSigners && (
              <ul className="text-sm">
                {(role.account.data?.signers || []).map((signer, idx) => {
                  return (
                    <p key={`signer-${idx}`} className="text-xs text-concrete">
                      {truncateString(signer)}
                    </p>
                  )
                })}
              </ul>
            )}
          </div>
        ) : (
          // Skeleton loading screen
          <div
            tabIndex={0}
            className={`h-10 w-full flex flex-row rounded-4xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
          />
        )}
      </div>
    </>
  )
}

const WalletRole = ({ role, proposal }) => {
  const activeUser = useStore((state) => state.activeUser)
  const toggleSendProposalModalOpen = useStore((state) => state.toggleSendProposalModalOpen)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)
  const activeUserHasApproved = role?.signatures
    ?.filter?.((signature) => signature?.proposalVersion === proposal?.version)
    ?.some(
      (signature) =>
        addressesAreEqual(activeUser?.address || "", signature.address) &&
        signature.type === ProposalSignatureType.APPROVE
    )
  const activeUserHasAProposalRole = addressesAreEqual(activeUser?.address || "", role?.address)

  const showSendButton =
    proposal?.status === ProposalStatus.DRAFT &&
    role.type === ProposalRoleType.AUTHOR &&
    activeUserHasAProposalRole

  const showSignButton =
    proposal?.status !== ProposalStatus.DRAFT &&
    activeUserHasAProposalRole &&
    !activeUserHasApproved &&
    role.type !== ProposalRoleType.AUTHOR // only show sign option if user is not author

  const showStatus =
    proposal?.status !== ProposalStatus.DRAFT || role.type === ProposalRoleType.AUTHOR

  return (
    <div className="flex flex-row w-full items-center justify-between">
      {role ? (
        <>
          <AccountMediaObject account={role?.account} showActionIcons={true} />
          <div className="flex flex-col items-end space-y-1">
            {/* show send button, or show sign button, or show approval status */}
            {showSendButton ? (
              <span
                className="text-electric-violet cursor-pointer"
                onClick={() => toggleSendProposalModalOpen(true)}
              >
                Send
              </span>
            ) : showSignButton ? (
              <span
                className="text-electric-violet cursor-pointer"
                onClick={() => toggleProposalApprovalModalOpen(true)}
              >
                Approve
              </span>
            ) : showStatus ? (
              <div className="flex flex-row items-center space-x-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    PROPOSAL_ROLE_APPROVAL_STATUS_MAP[role?.approvalStatus]?.color
                  }`}
                />

                <div className="font-bold text-xs uppercase tracking-wider">
                  {PROPOSAL_ROLE_APPROVAL_STATUS_MAP[role?.approvalStatus]?.copy}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </>
      ) : (
        // Skeleton loading screen
        <div
          tabIndex={0}
          className={`h-10 w-full flex flex-row rounded-4xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
        />
      )}
    </div>
  )
}

export const RoleSignature = ({ role, proposal }) => {
  const isSafe = role?.account?.addressType === AddressType.SAFE

  return (
    <>
      {isSafe ? (
        <SafeRole role={role} proposal={proposal} />
      ) : (
        <WalletRole role={role} proposal={proposal} />
      )}
    </>
  )
}
