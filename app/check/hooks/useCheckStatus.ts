import { useParam } from "@blitzjs/next"
import { useSafeMetadata } from "app/safe/hooks/useSafeMetadata"
import { CheckStatus } from "../types"

export const useCheckStatus = ({ check }) => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const { safe } = useSafeMetadata({ chainId: checkbookChainId, address: checkbookAddress })
  const quorum = safe?.quorum
  const validSignatures =
    check?.proofs?.filter((proof) => safe?.signers.includes(proof.signature.signer)).length || 0

  const status = check?.txnHash
    ? CheckStatus.EXECUTED
    : quorum && validSignatures >= quorum
    ? CheckStatus.READY
    : CheckStatus.PENDING

  return { status, validSignatures, quorum }
}

export default useCheckStatus
