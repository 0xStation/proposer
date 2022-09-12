import { toUtf8Bytes } from "@ethersproject/strings"
import { keccak256 } from "@ethersproject/keccak256"
import { BigNumber } from "@ethersproject/bignumber"
import { ProposalNew } from "app/proposalNew/types"
import { parseUnits } from "@ethersproject/units"

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
      Payment: [
        { name: "milestoneId", type: "uint256" },
        { name: "recipientAddress", type: "address" }, // recieves the reward from the proposal
        { name: "chainId", type: "uint256" },
        { name: "tokenAddress", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      Proposal: [
        { name: "type", type: "string" },
        { name: "timestamp", type: "uint256" }, // UNIX timestamp
        { name: "roles", type: "Role[]" },
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
      roles: proposal.roles.map((role) => {
        return { address: role.address, role: role.role }
      }),
      payments: proposal.data?.payments?.map((payment) => {
        return {
          milestoneId: payment.milestoneId,
          recipientAddress: payment.recipientAddress,
          chainId: payment.token.chainId,
          tokenAddress: payment.token.address,
          amount: parseUnits(payment.amount!, payment.token.decimals),
        }
      }),
    },
  }
}
