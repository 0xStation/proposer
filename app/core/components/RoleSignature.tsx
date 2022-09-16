import { ProposalNewApprovalStatus } from "@prisma/client"
import useStore from "../hooks/useStore"
import { addressesAreEqual } from "../utils/addressesAreEqual"
import AccountMediaObject from "./AccountMediaObject"

export const RoleSignature = ({ role, approvals }) => {
  const activeUser = useStore((state) => state.activeUser)
  const addressHasApproved = (address: string) => {
    return (
      approvals?.find((approval) => addressesAreEqual(address, approval.address))?.status ===
      ProposalNewApprovalStatus.COMPLETE
    )
  }
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)
  const activeUserHasSigned = approvals?.some(
    (approval) =>
      // approval exists for address -> happens in case of signing for personal wallet
      addressesAreEqual(activeUser?.address || "", approval.address) ||
      // one of approval's signatures exists for address -> happens for case of multisig
      approval?.signatures.some((signature) =>
        addressesAreEqual(activeUser?.address || "", signature.address)
      )
  )
  const activeUserHasAProposalRole = addressesAreEqual(activeUser?.address || "", role?.address)

  const showSignButton = activeUserHasAProposalRole && !activeUserHasSigned

  return (
    <div className="flex flex-row w-full items-center justify-between">
      {role && approvals ? (
        <>
          <AccountMediaObject account={role?.account} />
          <div className="flex flex-row items-center space-x-1">
            {showSignButton ? (
              <span
                className="text-electric-violet cursor-pointer"
                onClick={() => toggleProposalApprovalModalOpen(true)}
              >
                Sign
              </span>
            ) : (
              <div className="flex flex-row items-center space-x-1 ml-4">
                <span
                  className={`h-2 w-2 rounded-full bg-${
                    addressHasApproved(role?.address) ? "magic-mint" : "neon-carrot"
                  }`}
                />

                <div className="font-bold text-xs uppercase tracking-wider">
                  {addressHasApproved(role?.address) ? "approved" : "pending"}
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
