import { ProposalNew } from "app/proposalNew/types"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"

export const genProposalNewDigest = (proposal: ProposalNew) => {
  const milestones: any[] = []
  const payments: any[] = []

  proposal.milestones.forEach((milestone) => {
    milestones.push({
      index: milestone.index,
      title: milestone.data.title,
    })
    if (milestone.payments) {
      milestone.payments.forEach((payment) => {
        payments.push({
          milestoneIndex: milestone.index,
          recipientAddress: payment.recipientAddress,
          chainId: payment.data.token.chainId,
          tokenAddress: payment.data.token.address,
          amount: decimalToBigNumber(payment.amount!, payment.data.token.decimals || 0),
        })
      })
    }
  })

  return {
    domain: {
      // name aka feature name -
      // we're using schema-based versioning here.
      // The idea is everything that should have its own api + versioning
      // should have a domain. Keep hardcoded
      name: "Proposal",
      // use semver versioning https://semver.org/
      version: "0.0.1",
    },
    types: {
      Role: [
        { name: "address", type: "address" },
        { name: "role", type: "string" },
      ],
      Milestone: [
        { name: "index", type: "uint256" },
        { name: "title", type: "string" },
      ],
      Payment: [
        { name: "milestoneIndex", type: "uint256" },
        { name: "recipientAddress", type: "address" }, // receives the reward from the proposal
        { name: "chainId", type: "uint256" },
        { name: "tokenAddress", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      Proposal: [
        { name: "type", type: "string" },
        { name: "timestamp", type: "uint256" }, // UNIX timestamp
        { name: "roles", type: "Role[]" },
        { name: "milestones", type: "Milestone[]" },
        { name: "payments", type: "Payment[]" },
        { name: "title", type: "string" },
        { name: "body", type: "string" },
        // We're hardcoding "Station" to document where data is generated.
        // In the future, the idea is that other frontends would be
        // generating proposals with the same specifications as ours.
        { name: "app", type: "string" },
      ],
    },
    value: {
      type: proposal.type,
      timestamp: proposal.timestamp.valueOf(),
      title: proposal.data.content.title,
      body: proposal.data.content.body,
      // Hardcoding our app name. Other frontend app's can change this type
      // to reference where the data was generated down the road.
      app: "Station",
      roles: proposal.roles?.map((role) => {
        return { address: role.address, role: role.role }
      }),
      milestones: milestones.map((milestone) => {
        return {
          index: milestone.index,
          title: milestone.data.title,
        }
      }),
      payments: payments.map((payment) => {
        return {
          milestoneIndex: payment.milestone.index,
          recipientAddress: payment.recipientAddress,
          chainId: payment.data.token.chainId,
          tokenAddress: payment.data.token.address,
          amount: decimalToBigNumber(payment.amount!, payment.data.token.decimals || 0),
        }
      }),
    },
  }
}
