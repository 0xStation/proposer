import useStore from "app/core/hooks/useStore"
import { getHash } from "app/signatures/utils"
import { genGnosisTransactionDigest } from "app/signatures/gnosisTransaction"
import networks from "app/utils/networks.json"
import useSignature from "app/core/hooks/useSignature"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

const useGnosisSignatureToConfirmTransaction = (payment) => {
  const setToastState = useStore((state) => state.setToastState)
  const { signMessage: signMessageHook } = useSignature()
  const signMessage = async () => {
    // prompt the Metamask signature modal
    try {
      const nonce = await getNonce(
        payment.data.token.chainId,
        payment.data.multisigTransaction.safeTxHash
      )
      const transactionData = genGnosisTransactionDigest(payment, nonce)
      const signature = await signMessageHook(transactionData)
      const data = await addConfirmationSignatureToGnosisTransaction(signature, transactionData)
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

  const addConfirmationSignatureToGnosisTransaction = async (signature, transactionData) => {
    const apiHost = networks[payment.data.token.chainId]?.gnosisApi
    if (!apiHost) {
      throw Error("chainId not available on Gnosis")
    }

    const safeTxHash = getHash(transactionData.domain, transactionData.types, transactionData.value)
    const url = `${apiHost}/api/v1/multisig-transactions/${safeTxHash}/confirmations/`

    let response
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature: signature,
        }),
      })
    } catch (err) {
      console.log(err)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Failed to add signature to Gnosis Safe",
      })
    }
    return response
  }

  return { signMessage }
}

const getNonce = async (chainId, safeTxHash) => {
  const network = networks[chainId]?.gnosisNetwork
  if (!network) {
    throw Error("chainId not available on Gnosis")
  }
  const url = `https://safe-transaction.${network}.gnosis.io/api/v1/multisig-transactions/${safeTxHash}/`

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

export default useGnosisSignatureToConfirmTransaction
