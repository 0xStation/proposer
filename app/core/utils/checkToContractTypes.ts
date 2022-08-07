import { Check } from "app/check/types"
import { CheckApprovalMetadata } from "app/checkApproval/types"
import { BigNumber } from "@ethersproject/bignumber"

// prepare check object from database to types ready for ethers for signatures or transactions
export const checkToContractTypes = (check: Check) => {
  return {
    txns: check.data.signatureMessage.value.txns,
    // sort signatures in order of increasing signer address
    signatures: check.approvals
      .sort((a, b) =>
        BigNumber.from(a.signerAddress).gt(BigNumber.from(b.signerAddress)) ? 1 : -1
      ) // sort addresses in increasing order
      .map((a) => (a.data as CheckApprovalMetadata)?.signature),
  }
}
