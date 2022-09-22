export const genProposalNewApprovalDigest = ({ signerAddress, proposalHash }) => {
  return {
    domain: {
      name: "Station", // keep hardcoded
      version: "1.0.0", // keep hardcoded
    },
    types: {
      ProposalApproval: [
        { name: "proposalHash", type: "string" },
        { name: "timestamp", type: "uint256" }, // UNIX timestamp
        { name: "signerAddress", type: "address" },
        { name: "app", type: "string" },
      ],
    },
    value: {
      proposalHash,
      timestamp: Date.now(),
      signerAddress,
      app: "Station",
    },
  }
}
