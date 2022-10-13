import useStore from "app/core/hooks/useStore"
import { getHash } from "app/signatures/utils"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { genGnosisTransactionDigest } from "app/signatures/gnosisTransaction"
import networks from "app/utils/networks.json"
import useSignature from "app/core/hooks/useSignature"

const useGnosisSignature = (payment) => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const { signMessage: signMessageHook } = useSignature()
  const signMessage = async () => {
    // prompt the Metamask signature modal
    try {
      const nonce = await getNonce()
      const transactionData = genGnosisTransactionDigest(payment, nonce)

      const signature = await signMessageHook(transactionData)
      console.log(signature)
      const data = await createTransaction(signature, transactionData)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Transaction queued to your Gnosis Safe",
      })
      return data
    } catch (err) {
      console.log(err)
      let message = "Signature failed"
      if (err.name === "ConnectorNotFoundError") {
        message = "Wallet connection error, please disconnect and reconnect your wallet."
      }
      if (err.name === "ChainMismatchError") {
        let regexPattern = /".*?"/g
        let stringsInQuotes = regexPattern.exec(err.message) as RegExpExecArray
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

  const getNonce = async () => {
    const network = networks[payment.data.token.chainId]?.gnosisNetwork
    if (!network) {
      throw Error("chainId not available on Gnosis")
    }
    const url = `https://safe-transaction.${network}.gnosis.io/api/v1/safes/${toChecksumAddress(
      payment.senderAddress
    )}/multisig-transactions/`

    let response
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      return data.countUniqueNonce
    } catch (err) {
      console.error(err)
      return null
    }
  }

  return { signMessage }
}

export default useGnosisSignature
