import { ZERO_ADDRESS } from "app/core/utils/constants"
import { preparePaymentTransaction } from "app/transaction/payments"

export const genGnosisTransactionDigest = (activePayment, nonce) => {
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

  return {
    domain: {
      verifyingContract: safeAddress,
      chainId: chainId,
    },
    /// @param to Destination address.
    /// @param value Ether value.
    /// @param data Data payload.
    /// @param operation Operation type.
    /// @param safeTxGas Fas that should be used for the safe transaction.
    /// @param baseGas Gas costs for data used to trigger the safe transaction.
    /// @param gasPrice Maximum gas price that should be used for this transaction.
    /// @param gasToken Token address (or 0 if ETH) that is used for the payment.
    /// @param refundReceiver Address of receiver of gas payment (or 0 if tx.origin).
    /// @param nonce Transaction nonce.
    types: {
      SafeTx: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" }, // bytes calldata
        { name: "operation", type: "uint8" }, // Enum.Operation
        { name: "safeTxGas", type: "uint256" },
        { name: "baseGas", type: "uint256" },
        { name: "gasPrice", type: "uint256" },
        { name: "gasToken", type: "address" },
        { name: "refundReceiver", type: "address" },
        { name: "nonce", type: "uint256" },
      ],
    },
    value: {
      to: to,
      value: String(value),
      data: data,
      operation: 0,
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: ZERO_ADDRESS,
      refundReceiver: ZERO_ADDRESS,
      nonce: String(nonce),
    },
  }
}
