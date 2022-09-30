export const genGnosisTransactionDigest = (activePayment, nonce) => {
  const sendTo = activePayment.recipientAddress
  const sendAmount = activePayment.amount
  const safeAddress = activePayment.senderAddress
  const chainId = activePayment.data.token.chainId

  return {
    domain: {
      verifyingContract: safeAddress,
      chainId: chainId,
    },
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
      to: sendTo,
      value: String(sendAmount * 10e18),
      data: "0x",
      operation: 0,
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000",
      refundReceiver: "0x0000000000000000000000000000000000000000",
      nonce: String(nonce),
    },
  }
}
