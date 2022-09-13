import { ProposalNew } from "app/proposalNew/types"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"

export const genProposalNewDigest = (proposal: ProposalNew) => {
  return {
    domain: {
      name: "Proposal", // keep hardcoded
      version: "1", // keep hardcoded
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
        { name: "recipientAddress", type: "address" }, // recieves the reward from the proposal
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
      ],
    },
    value: {
      type: proposal.type,
      timestamp: proposal.timestamp.valueOf(),
      title: proposal.data.content.title,
      body: proposal.data.content.body,
      roles: proposal.roles?.map((role) => {
        return { address: role.address, role: role.role }
      }),
      milestones: proposal.milestones?.map((milestone) => {
        return {
          index: milestone.index,
          title: milestone.data.title,
        }
      }),
      payments: proposal.payments?.map((payment) => {
        return {
          milestoneIndex: payment.milestoneIndex,
          recipientAddress: payment.recipientAddress,
          chainId: payment.data.token.chainId,
          tokenAddress: payment.data.token.address,
          amount: decimalToBigNumber(payment.amount!, payment.data.token.decimals || 0),
        }
      }),
    },
  }
}
