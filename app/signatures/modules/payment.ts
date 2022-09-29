export const paymentModule = {
  Payment: [
    { name: "paymentId", type: "string" }, // uuid
    { name: "milestoneId", type: "string" }, // uuid
    { name: "recipientAddress", type: "address" }, // receives the reward from the proposal
    { name: "amount", type: "uint256" },
    { name: "chainId", type: "uint256" },
    { name: "tokenAddress", type: "address" },
  ],
}
