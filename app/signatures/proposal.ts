import { Proposal } from "app/proposal/types"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"

export const genProposalDigest = (proposal: Proposal) => {
  const milestoneIdToIndex = {}
  proposal.milestones?.forEach((milestone) => {
    milestoneIdToIndex[milestone.id] = milestone.index
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
        { name: "amount", type: "uint256" },
        { name: "token", type: "Token" },
      ],
      Token: [
        { name: "chainId", type: "uint256" },
        { name: "address", type: "address" },
        { name: "type", type: "string" },
        { name: "name", type: "string" }, // optional, ERC1155 does not support
        { name: "symbol", type: "string" }, // optional, ERC1155 does not support
        { name: "decimals", type: "uint8" }, // optional, ERC721 and ERC1155 do not support
      ],
      Proposal: [
        { name: "timestamp", type: "uint256" }, // UNIX timestamp
        { name: "roles", type: "Role[]" },
        { name: "milestones", type: "Milestone[]" },
        { name: "payments", type: "Payment[]" },
        { name: "title", type: "string" },
        { name: "body", type: "string" },
        { name: "proposalId", type: "string" }, // UUID
        // We're hardcoding "Station" to document where data is generated.
        // In the future, the idea is that other frontends would be
        // generating proposals with the same specifications as ours.
        { name: "app", type: "string" },
      ],
    },
    value: {
      timestamp: proposal.timestamp.valueOf(),
      title: proposal.data.content.title,
      body: proposal.data.content.body,
      proposalId: proposal.id,
      // Hardcoding our app name. Other frontend app's can change this type
      // to reference where the data was generated down the road.
      app: "Station",
      roles: proposal.roles?.map((role) => {
        return { address: role.address, role: role.type }
      }),
      milestones: proposal.milestones?.map((milestone) => {
        return {
          index: milestone.index,
          title: milestone.data.title,
        }
      }),
      payments: proposal.payments?.map((payment) => {
        const token = payment.data.token
        return {
          milestoneIndex: milestoneIdToIndex[payment.milestoneId],
          recipientAddress: payment.recipientAddress,
          // uint256 has max integer size of 2^256 - 1, but js/ts can only handle 2^53 so we need a more scalable representation
          // ether's BigNumber is great for this, but looks funny when placing within a JSON file so we opt for the string representation
          // strings are more interoperable because they are language agnostic and human readable
          // wagmi can also parse strings just fine into the uint256 representation needed for EIP712 signatures
          amount: decimalToBigNumber(payment.amount!, token.decimals || 0).toString(),
          token: {
            chainId: token.chainId,
            address: token.address,
            type: token?.type || "",
            name: token?.name || "",
            symbol: token?.symbol || "",
            decimals: token?.decimals || 0,
          },
        }
      }),
    },
  }
}
