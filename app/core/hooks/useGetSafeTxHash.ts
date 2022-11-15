import { getHash } from "app/signatures/utils"
import { genGnosisTransactionDigest } from "app/signatures/gnosisTransaction"
import { getSafeContractVersion } from "../utils/getSafeContractVersion"

const useGetSafeTxHash = async (payment) => {
  const contractVersion = await getSafeContractVersion(
    payment.data.token.chainId,
    payment.senderAddress
  )
  const transactionData = genGnosisTransactionDigest(
    payment,
    payment.data.multisigTransaction.nonce,
    contractVersion
  )

  const safeTxHash = getHash(transactionData.domain, transactionData.types, transactionData.value)
  return safeTxHash
}

export default useGetSafeTxHash
