import { Check } from "app/check/types"
import { CheckApprovalMetadata } from "app/checkApproval/types"
import decimalToBigNumber from "./decimalToBigNumber"
import { zeroAddress } from "./constants"

// prepare check object from database to types ready for ethers for signatures or transactions
export const checkToContractTypes = (check?: Check) => {
  if (!check) {
    return {
      recipient: zeroAddress,
      token: zeroAddress,
      amount: 0,
      deadline: 0,
      nonce: 0,
      signatures: [],
    }
  }
  return {
    recipient: check.recipientAddress,
    token: check.tokenAddress,
    amount: decimalToBigNumber(check.tokenAmount, 18),
    deadline: check.deadline.valueOf(),
    nonce: check.nonce,
    signatures: check.approvals.map((a) => (a.data as CheckApprovalMetadata)?.signature),
  }
}
