import { useState } from "react"
import useStore from "../hooks/useStore"
import { addressesAreEqual } from "../utils/addressesAreEqual"
import { PROPOSAL_ROLE_APPROVAL_STATUS_MAP } from "../utils/constants"
import AccountMediaObject from "./AccountMediaObject"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import GnosisSafeSignersModal from "app/core/components/GnosisSafeSignersModal"
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
  const newQuroumExists =
    role?.data?.preApprovalQuorum && role?.data?.preApprovalQuorum !== role.account.data?.quorum

  return (
    <>
      <div className="flex flex-row w-full items-center justify-between">
        {role ? (
          <div className="flex flex-col w-full">
            <div className="flex flex-row w-full items-center justify-between">
              <AccountMediaObject account={role?.account} showActionIcons={true} />
              <div className="flex flex-col items-end space-y-1 relative group">
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
                      {PROPOSAL_ROLE_APPROVAL_STATUS_MAP[role?.approvalStatus]?.copy}{" "}
                      {newQuroumExists && "*"}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                <ProgressCircleAndNumber
                  numerator={totalSafeSignersSigned}
                  denominator={
                    newQuroumExists ? role.data.preApprovalQuorum : role.account.data?.quorum
                  }
                />

                {newQuroumExists && (
                  <span className="absolute w-[100px] text-xs group-hover:block hidden bg-wet-concrete p-2 rounded right-[-110px]">
                    The quorum of this safe has changed to {role.account.data?.quorum} since this
                    proposal was approved.
                  </span>
                )}
              </div>
            </div>
            <p
              className="text-sm text-electric-violet font-bold mt-1 cursor-pointer"
              onClick={() => setToggleSigners(!toggleSigners)}
            >
              See multisig signers
            </p>
            <GnosisSafeSignersModal
              isOpen={toggleSigners}
              setIsOpen={setToggleSigners}
              role={role}
            />
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
