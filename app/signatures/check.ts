import { ZERO_ADDRESS } from "app/core/utils/constants"

export const genCheckSignatureMessage = (
  chainId,
  checkbookAddress,
  nonce,
  deadline: Date,
  recipient: string,
  token: string,
  amount
) => {
  return {
    domain: {
      name: "Checkbook", // keep hardcoded
      version: "1", // keep hardcoded
      chainId,
      verifyingContract: checkbookAddress,
    },
    types: {
      Txn: [
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint48" },
        { name: "executor", type: "address" },
        { name: "target", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
      ],
      BatchTxn: [{ name: "txns", type: "Txn[]" }],
    },
    value: {
      txns: [
        {
          nonce: nonce,
          deadline: deadline.valueOf(),
          executor: ZERO_ADDRESS,
          target: recipient,
          value: amount,
          data: "0x",
        },
      ],
    },
  }
}
