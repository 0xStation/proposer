import { ProposalRoleApprovalStatus } from "@prisma/client"
import useStore from "../hooks/useStore"
import { addressesAreEqual } from "../utils/addressesAreEqual"
import AccountMediaObject from "./AccountMediaObject"

export const RoleSignature = ({ role, signatures }) => {
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
                    role?.approvalStatus === ProposalRoleApprovalStatus.COMPLETE
                      ? "magic-mint"
                      : "neon-carrot"
                  }`}
                />

                <div className="font-bold text-xs uppercase tracking-wider">
                  {role?.approvalStatus === ProposalRoleApprovalStatus.COMPLETE
                    ? "approved"
                    : "pending"}
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
