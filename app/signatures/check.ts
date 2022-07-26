import { Check } from "@prisma/client"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"

export const genCheckSignatureMessage = (check: Check, decimals: number) => {
  return {
    domain: {
      name: "Checkbook", // keep hardcoded
      version: "1", // keep hardcoded
      chainId: check.chainId,
      verifyingContract: check.fundingAddress,
    },
    types: {
      Check: [
        { name: "recipient", type: "address" },
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    },
    value: {
      recipient: check.recipientAddress,
      token: check.tokenAddress,
      amount: decimalToBigNumber(check.tokenAmount, decimals),
      deadline: check.deadline.valueOf(),
      nonce: check.nonce,
    },
  }
}
