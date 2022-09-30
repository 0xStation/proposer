import useStore from "app/core/hooks/useStore"
import { useSignTypedData } from "wagmi"
import { getHash } from "app/signatures/utils"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { genGnosisTransactionDigest } from "app/signatures/gnosisTransaction"
import networks from "app/utils/networks.json"

const useGnosisSignature = (payment) => {
  const setToastState = useStore((state) => state.setToastState)
  let { signTypedDataAsync } = useSignTypedData()

  const signMessage = async () => {
    // prompt the Metamask signature modal
    try {
      const nonce = await getNonce()

      const transactionData = genGnosisTransactionDigest(payment, nonce)
      const signature = await signTypedDataAsync(transactionData)
      const data = await createTransaction(signature, transactionData)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Gnosis tx queued",
      })
      return data
    } catch (e) {
      console.log(e)
      let message = "Signature failed"
      if (e.name === "ConnectorNotFoundError") {
        message = "Wallet connection error, please disconnect and reconnect your wallet."
      }
      setToastState({
        isToastShowing: true,
        type: "error",
        message,
      })
    }
  }

  const createTransaction = async (signature, transactionData) => {
    const url = `https://safe-client.gnosis.io/v1/chains/${
      payment.data.token.chainId
    }/transactions/${toChecksumAddress(payment.senderAddress)}/propose`

    let response
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature: signature,
          safeTxHash: getHash(transactionData.domain, transactionData.types, transactionData.value),
          sender: "0x8b028c3a755C663Ed7E08D6A93581B8FEc389cd2",
          ...transactionData.value,
        }),
      })

      const data = await response.json()
      return data
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const getNonce = async () => {
    const network = networks[payment.data.token.chainId]?.gnosisNetwork
    if (!network) {
      throw Error("chainId not available on Gnosis")
    }
    const url = `https://safe-transaction.${network}.gnosis.io/api/v1/safes/${toChecksumAddress(
      payment.senderAddress
    )}/`

    let response
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      return data.nonce
    } catch (err) {
      console.error(err)
      return null
    }
  }

  return { signMessage }
}

export default useGnosisSignature
