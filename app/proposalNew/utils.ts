// returns true if all signatures are complete for a given proposal
export const areApprovalsComplete = (proposalRoles, proposalApprovals) => {
  const requiredApprovals = {}

  proposalRoles?.forEach((role) => {
    requiredApprovals[role.address] = false
  })

  proposalApprovals?.forEach((approval) => {
    requiredApprovals[approval.address] = true
  })

  return Object.values(requiredApprovals).every((hasApproved) => hasApproved)
}
