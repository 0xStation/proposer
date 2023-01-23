import { useParam } from "@blitzjs/next"
import { useSafeMetadata } from "app/safe/hooks/useSafeMetadata"
import { CheckStatus } from "../types"

export const useBatchCheckStatus = ({ checks }) => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const { safe } = useSafeMetadata({ chainId: checkbookChainId, address: checkbookAddress })
  const quorum = safe?.quorum

  const status = checks.every((check) => check.txnHash)
    ? CheckStatus.EXECUTED
    : quorum &&
      checks.every(
        (check) =>
          quorum &&
          (check.proofs.filter((proof) => safe.signers.includes(proof.signature.signer))?.length ||
            0) >= quorum
      )
    ? CheckStatus.READY
    : CheckStatus.PENDING

  return { status }
}

export default useBatchCheckStatus
