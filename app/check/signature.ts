import { Check } from "app/check/types"
import { CHECKBOOK_MODULE_ADDRESS, ZERO_ADDRESS } from "app/core/utils/constants"

export const genCheckDigest = (check: Check) => {
  return {
    domain: {
      name: "Checkbook",
      version: "1.0.0",
      verifyingContract: CHECKBOOK_MODULE_ADDRESS[check.chainId],
    },
    types: {
      Action: [
        { name: "chainId", type: "uint256" },
        { name: "safe", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "executor", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
      ],
    },
    value: {
      chainId: check.chainId,
      safe: check.address,
      nonce: check.nonce,
      executor: ZERO_ADDRESS,
      to: check.data.txn.to,
      value: check.data.txn.value,
      data: check.data.txn.data,
    },
  }
}
