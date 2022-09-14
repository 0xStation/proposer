// returns true if all signatures are complete for a given proposal
export const areSignaturesComplete = (proposal) => {
  const requiredSignatures = {}

  proposal?.roles.forEach((role) => {
    requiredSignatures[role.address] = false
  })

  proposal?.signatures?.forEach((commitment) => {
    requiredSignatures[commitment.address] = true
  })

  return Object.values(requiredSignatures).every((hasSigned) => hasSigned)
}