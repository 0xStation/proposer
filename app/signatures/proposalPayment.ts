import { ProposalPayment } from "app/proposalPayment/types"

export const genProposalPaymentDigest = (payment: ProposalPayment) => {
  if (!payment) return {}
  return {
    domain: {
      // name aka feature name -
      // we're using schema-based versioning here.
      // The idea is everything that should have its own api + versioning
      // should have a domain. Keep hardcoded
      name: "ProposalPayment",
      // use semver versioning https://semver.org/
      version: "0.0.1",
    },
    types: {
      Payment: [
        { name: "paymentId", type: "string" }, // UUID
        { name: "proposalId", type: "string" },
        { name: "transactionHash", type: "address" },
        { chainId: "chainId", type: "uint256" },
        { name: "timestamp", type: "uint256" }, // UNIX timestamp
        // We're hardcoding "Station" to document where data is generated.
        // In the future, the idea is that other frontends would be
        // generating proposals with the same specifications as ours.
        { name: "app", type: "string" },
      ],
    },
    value: {
      paymentId: payment.id,
      proposalId: payment.proposalId,
      recipientAddress: payment.recipientAddress,
      senderAddress: payment.senderAddress,
      chainId: payment.data.token.chainId,
      timestamp: Date.now(),
      // Hardcoding our app name. Other frontend app's can change this type
      // to reference where the data was generated down the road.
      app: "Station",
    },
  }
}
