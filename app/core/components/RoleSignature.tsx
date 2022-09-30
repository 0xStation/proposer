import { useState, useEffect } from "react"
import useStore from "../hooks/useStore"
import { addressesAreEqual } from "../utils/addressesAreEqual"
import { PROPOSAL_ROLE_APPROVAL_STATUS_MAP } from "../utils/constants"
import AccountMediaObject from "./AccountMediaObject"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import truncateString from "app/core/utils/truncateString"
import { activeUserMeetsCriteria } from "app/core/utils/activeUserMeetsCriteria"
import {
  ProposalRoleApprovalStatus,
  ProposalRoleType,
  ProposalSignatureType,
  ProposalStatus,
} from "@prisma/client"

const SafeRole = ({ role, signatures, proposalStatus }) => {
  const activeUser = useStore((state) => state.activeUser)
  const [safeDetails, setSafeDetails] = useState<any | null>({})
  const [signers, setSigners] = useState<string[]>([])
  const [toggleSigners, setToggleSigners] = useState<boolean>(false)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)

  const activeUserHasSigned = activeUserMeetsCriteria(activeUser, signatures)
  const activeUserHasAProposalRole = activeUserMeetsCriteria(activeUser, signers)
  const showSignButton =
    proposalStatus !== ProposalStatus.DRAFT && activeUserHasAProposalRole && !activeUserHasSigned

  useEffect(() => {
    const getGnosisDetails = async () => {
      const gnosisSafeDetails = await getGnosisSafeDetails(role.account.data.chainId, role.address)
      setSafeDetails(gnosisSafeDetails)
      setSigners(gnosisSafeDetails?.signers)
    }

    getGnosisDetails()
  }, [role])

  const totalSafeSignersSigned =
    signatures &&
    signatures.filter((signature) => {
      return signers.some((signer) => {
        return (
          addressesAreEqual(signature.address, signer) &&
          signature.type === ProposalSignatureType.APPROVE
        )
      })
    }).length

  const approvalStatus =
    proposalStatus === ProposalStatus.DRAFT
      ? role.type !== ProposalRoleType.AUTHOR
        ? ProposalRoleApprovalStatus.AWAITING_AUTHOR
        : ProposalRoleApprovalStatus.PENDING
      : role?.approvalStatus

  return (
    <>
      <div className="flex flex-row w-full items-center justify-between">
        {role && signatures ? (
          <div className="flex flex-col w-full">
            <div className="flex flex-row w-full items-center justify-between">
              <AccountMediaObject account={role?.account} />
              <div className="flex flex-col items-end space-y-1">
                {showSignButton ? (
                  <span
                    className="text-electric-violet cursor-pointer"
                    onClick={() => toggleProposalApprovalModalOpen(true)}
                  >
                    Sign
                  </span>
                ) : (
                  <div className="flex flex-row items-center space-x-1">
                    <span
                      className={`h-2 w-2 rounded-full ${PROPOSAL_ROLE_APPROVAL_STATUS_MAP[approvalStatus]?.color}`}
                    />

                    <div className="font-bold text-xs uppercase tracking-wider">
                      {PROPOSAL_ROLE_APPROVAL_STATUS_MAP[approvalStatus]?.copy}
                    </div>
                  </div>
                )}
                <ProgressCircleAndNumber
                  numerator={
                    totalSafeSignersSigned > safeDetails?.quorum
                      ? safeDetails?.quorum
                      : totalSafeSignersSigned
                  }
                  denominator={safeDetails?.quorum}
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
                {signers.map((signer, idx) => {
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

const WalletRole = ({ role, signatures, proposalStatus }) => {
  const activeUser = useStore((state) => state.activeUser)
  const toggleSendProposalModalOpen = useStore((state) => state.toggleSendProposalModalOpen)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)
  const activeUserHasApproved = signatures?.some(
    (signature) =>
      addressesAreEqual(activeUser?.address || "", signature.address) &&
      signature.type === ProposalSignatureType.APPROVE
  )
  const activeUserHasAProposalRole = addressesAreEqual(activeUser?.address || "", role?.address)

  const showSendButton =
    proposalStatus === ProposalStatus.DRAFT && role.type === ProposalRoleType.AUTHOR

  const showSignButton =
    proposalStatus !== ProposalStatus.DRAFT &&
    activeUserHasAProposalRole &&
    !activeUserHasApproved &&
    role.type !== ProposalRoleType.AUTHOR

  const approvalStatus =
    proposalStatus === ProposalStatus.DRAFT
      ? role.type !== ProposalRoleType.AUTHOR
        ? ProposalRoleApprovalStatus.AWAITING_AUTHOR
        : ProposalRoleApprovalStatus.PENDING
      : role?.approvalStatus

  return (
    <div className="flex flex-row w-full items-center justify-between">
      {role && signatures ? (
        <>
          <AccountMediaObject account={role?.account} />
          <div className="flex flex-col items-end space-y-1">
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
                Sign
              </span>
            ) : (
              <div className="flex flex-row items-center space-x-1">
                <span
                  className={`h-2 w-2 rounded-full ${PROPOSAL_ROLE_APPROVAL_STATUS_MAP[approvalStatus]?.color}`}
                />

                <div className="font-bold text-xs uppercase tracking-wider">
                  {PROPOSAL_ROLE_APPROVAL_STATUS_MAP[approvalStatus]?.copy}
                </div>
              </div>
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

export const RoleSignature = ({ role, signatures, proposalStatus }) => {
  const isSafe = role.account.addressType === "SAFE"

  return (
    <>
      {isSafe ? (
        <SafeRole role={role} signatures={signatures} proposalStatus={proposalStatus} />
      ) : (
        <WalletRole role={role} signatures={signatures} proposalStatus={proposalStatus} />
      )}
    </>
  )
}
