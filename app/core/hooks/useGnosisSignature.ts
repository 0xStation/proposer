import useStore from "app/core/hooks/useStore"
import { useSignTypedData } from "wagmi"
import { getHash } from "app/signatures/utils"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { genGnosisTransactionDigest } from "app/signatures/gnosisTransaction"
import networks from "app/utils/networks.json"

const useGnosisSignature = (payment) => {
  const activeUser = useStore((state) => state.activeUser)
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
      if (e.name === "ChainMismatchError") {
        let regexPattern = /".*?"/g
        let stringsInQuotes = regexPattern.exec(e.message) as RegExpExecArray
        let correctChain = stringsInQuotes[0] as string
        let correctChainCleaned = correctChain.replace(/['"]+/g, "")
        message = `Incorrect chain, please switch to the ${correctChainCleaned}.`
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
          sender: activeUser?.address,
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

  /**
   * get nonce returns the active nonce for the safe
   * We actually need to get the pending transactions as well.
   *
   * If we have a safe with a current nonce of 5, if there is already a tx with a nonce of 5
   * It will not be overwritten. So, if we want a totally new fresh tx on the queue, we need
   * to get the current nonce + the number of actively queued txs to get the next new nonce
   */
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
