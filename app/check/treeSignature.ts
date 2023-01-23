import { FLEXIBLE_SIGNING_CONTRACT } from "app/core/utils/constants"

export const genTreeDigest = (root) => {
  return {
    domain: {
      name: "Checkbook",
      version: "1.0.0",
      verifyingContract: FLEXIBLE_SIGNING_CONTRACT, // to be changed once the same contract address is deployed to all chains
    },
    types: {
      Tree: [{ name: "root", type: "bytes32" }],
    },
    value: {
      root: root,
    },
  }
}
