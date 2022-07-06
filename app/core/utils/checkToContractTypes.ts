import { Check } from "app/check/types"
import { CheckApprovalMetadata } from "app/checkApproval/types"
import decimalToBigNumber from "./decimalToBigNumber"
import { ZERO_ADDRESS } from "./constants"
import { BigNumber } from "ethers"

// prepare check object from database to types ready for ethers for signatures or transactions
export const checkToContractTypes = (check: Check) => {
  return {
    recipient: check.recipientAddress,
    token: check.tokenAddress,
    amount: decimalToBigNumber(check.tokenAmount, 18),
    deadline: check.deadline.valueOf(),
    nonce: check.nonce,
    // sort signatures in order of increasing signer address
    signatures: check.approvals
      .sort((a, b) =>
        BigNumber.from(a.signerAddress).gt(BigNumber.from(b.signerAddress)) ? 1 : -1
      ) // sort addresses in increasing order
      .map((a) => (a.data as CheckApprovalMetadata)?.signature),
  }
}
