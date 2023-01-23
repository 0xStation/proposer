import { preparePaymentTransaction } from "app/transaction/payments"
import { genGnosisTransactionDigest } from "app/signatures/gnosisTransaction"

export const genGnosisPaymentDigest = (activePayment, nonce, contractVersion) => {
  const sendTo = activePayment.recipientAddress
  const sendAmount = activePayment.amount
  const safeAddress = activePayment.senderAddress
  const chainId = activePayment.data.token.chainId

  /**
   * value is the amount of ETH being sent in the function call and is only non-zero if we are
   * transferring ETH specifically. We have a utility preparePaymentTransaction to handle this logic.
   */
  const { to, value, data } = preparePaymentTransaction(
    sendTo,
    activePayment.data.token,
    sendAmount
  )

  return genGnosisTransactionDigest(chainId, safeAddress, to, value, data, nonce, contractVersion)
}
