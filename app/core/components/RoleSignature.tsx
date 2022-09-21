import { useState, useEffect } from "react"
import useStore from "../hooks/useStore"
import { addressesAreEqual } from "../utils/addressesAreEqual"
import { PROPOSAL_ROLE_APPROVAL_STATUS_MAP } from "../utils/constants"
import AccountMediaObject from "./AccountMediaObject"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import truncateString from "app/core/utils/truncateString"
import ApproveProposalNewModal from "app/proposalNew/components/ApproveProposalNewModal"

const SafeRole = ({ role, signatures, proposal }) => {
  const activeUser = useStore((state) => state.activeUser)
  const [safeDetails, setSafeDetails] = useState<any | null>({})
  const [signers, setSigners] = useState<string[]>([])
  const [toggleSigners, setToggleSigners] = useState<boolean>(false)
  const [approveProposalModalOpen, setApproveProposalModalOpen] = useState<boolean>(false)

  const activeUserHasSigned = signatures?.some((signature) =>
    // signature exists for address -> happens in case of signing for personal wallet
    addressesAreEqual(activeUser?.address || "", signature.address)
  )
  const activeUserHasAProposalRole = signers.some((signer) => {
    return addressesAreEqual(activeUser?.address || "", signer)
  })

  const showSignButton = activeUserHasAProposalRole && !activeUserHasSigned

  useEffect(() => {
    const getGnosisDetails = async () => {
      const gnosisSafeDetails = await getGnosisSafeDetails(role.account.data.chainId, role.address)
      setSafeDetails(gnosisSafeDetails)
      setSigners(gnosisSafeDetails?.signers)
    }

    getGnosisDetails()
  }, [role])

  const totalSafeSignersSigned = signatures.filter((signature) => {
    return signers.some((signer) => {
      return addressesAreEqual(signature.address, signer)
    })
  }).length

  return (
    <>
      <ApproveProposalNewModal
        isOpen={approveProposalModalOpen}
        setIsOpen={setApproveProposalModalOpen}
        proposal={proposal}
        additionalRoles={[
          { roleId: role.id, complete: totalSafeSignersSigned == safeDetails?.quorum - 1 },
        ]}
      />
      <div className="flex flex-row w-full items-center justify-between">
        {role && signatures ? (
          <div className="flex flex-col w-full">
            <div className="flex flex-row w-full items-center justify-between">
              <AccountMediaObject account={role?.account} />
              <div className="flex flex-col items-end space-y-1">
                {showSignButton ? (
                  <span
                    className="text-electric-violet cursor-pointer"
                    onClick={() => setApproveProposalModalOpen(true)}
                  >
                    Sign
                  </span>
                ) : (
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
                )}
                <ProgressCircleAndNumber
                  numerator={totalSafeSignersSigned}
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

const WalletRole = ({ role, signatures, proposal }) => {
  const activeUser = useStore((state) => state.activeUser)

  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)
  const activeUserHasSigned = signatures?.some((signature) =>
    // signature exists for address -> happens in case of signing for personal wallet
    addressesAreEqual(activeUser?.address || "", signature.address)
  )
  const activeUserHasAProposalRole = addressesAreEqual(activeUser?.address || "", role?.address)

  const showSignButton = activeUserHasAProposalRole && !activeUserHasSigned

  return (
    <div className="flex flex-row w-full items-center justify-between">
      {role && signatures ? (
        <>
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
                  className={`h-2 w-2 rounded-full ${
                    PROPOSAL_ROLE_APPROVAL_STATUS_MAP[role?.approvalStatus]?.color
                  }`}
                />

                <div className="font-bold text-xs uppercase tracking-wider">
                  {PROPOSAL_ROLE_APPROVAL_STATUS_MAP[role?.approvalStatus]?.copy}
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

export const RoleSignature = ({ role, signatures, proposal }) => {
  const isSafe = role.account.addressType === "SAFE"

  return (
    <>
      {isSafe ? (
        <SafeRole role={role} signatures={signatures} proposal={proposal} />
      ) : (
        <WalletRole role={role} signatures={signatures} proposal={proposal} />
      )}
    </>
  )
}
