export const genProposalNewApprovalDigest = ({ signerAddress, proposalHash, proposalId }) => {
  return {
    domain: {
      // name aka feature name -
      // we're using schema-based versioning here.
      // The idea is everything that should have its own api + versioning
      // should have a domain. Keep hardcoded
      name: "ProposalSignature", // keep hardcoded
      version: "1.0.0", // references the web app's version
    },
    types: {
      ProposalApproval: [
        { name: "proposalId", type: "string" }, // uuid
        { name: "proposalHash", type: "string" }, // typed data hash as defined by EIP712, implemented with ether's _TypedDataEncoder
        { name: "timestamp", type: "uint256" }, // UNIX timestamp
        { name: "signerAddress", type: "address" },
        // We're hardcoding "Station" to document where data is generated.
        // In the future, the idea is that other frontends would be
        // generating proposals with the same specifications as ours.
        { name: "app", type: "string" },
      ],
    },
    value: {
      proposalHash,
      timestamp: Date.now(),
      signerAddress,
      proposalId: proposalId,
      // Hardcoding our app name. Other frontend app's can change this type
      // to reference where the data was generated down the road.
      app: "Station",
    },
  }
}
