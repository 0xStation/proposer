import "app/core/utils/addressesAreEqual"
import { AddressType, ParticipantApprovalStatus, ProposalRoleApprovalStatus } from "@prisma/client"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import useStore from "app/core/hooks/useStore"
import useGetUsersParticipants from "./useGetUsersParticipants"
import { ProposalParticipant } from "../types"

// Get the roles the activeUser can approve for based on the roles' approval status and user's previous signatures
const useGetParticipantsUserCanApprove = ({
  proposalId,
  proposalVersion,
}: {
  proposalId: string | undefined | null
  proposalVersion: number
}): {
  participants: (ProposalParticipant & { oneSignerNeededToComplete: boolean })[]
  isLoading: boolean
} => {
  const activeUser = useStore((state) => state.activeUser)
  const { participants, isLoading } = useGetUsersParticipants(proposalId)

  const awaitingApproval = participants
    .filter((participant) => {
      return (
        // filter on PENDING status
        participant.approvalStatus === ParticipantApprovalStatus.PENDING &&
        // filter on user having not signed already
        // to be used by multisigs that can collect many signatures while role is PENDING
        !participant?.signatures
          ?.filter((signature) => signature.proposalVersion === proposalVersion)
          ?.some((signature) => {
            return addressesAreEqual(signature.address, activeUser?.address)
          })
      )
    })
    .map((participant) => {
      return {
        ...participant,
        oneSignerNeededToComplete:
          // if account is a wallet, only one signature is needed to complete approval
          participant.account?.addressType === AddressType.WALLET
            ? true
            : // if account is a safe, current signature count is one less than quorum
              (participant?.signatures?.filter(
                (signature) => signature.proposalVersion === proposalVersion
              )?.length || 0) +
                1 ===
              participant.account?.data.quorum,
      }
    })

  return { participants: awaitingApproval, isLoading }
}

export default useGetParticipantsUserCanApprove
