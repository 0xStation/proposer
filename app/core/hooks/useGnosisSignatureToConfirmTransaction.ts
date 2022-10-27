import useStore from "app/core/hooks/useStore"
import { getHash } from "app/signatures/utils"
import { genGnosisTransactionDigest } from "app/signatures/gnosisTransaction"
import networks from "app/utils/networks.json"
import useSignature from "app/core/hooks/useSignature"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"

const useGnosisSignatureToConfirmTransaction = (payment) => {
  const setToastState = useStore((state) => state.setToastState)
  const { signMessage: signMessageHook } = useSignature()

  const signMessage = async () => {
    // prompt the Metamask signature modal
    try {
      const contractVersion = await getContractVersion()
      const transactionData = genGnosisTransactionDigest(
        payment,
        payment.data.multisigTransaction.nonce,
        contractVersion
      )
      const signature = await signMessageHook(transactionData)
      const data = await addConfirmationSignatureToGnosisTransaction(signature, transactionData)

      // success case returns no code, failure returns code
      // only code returned in our experience so far is 1337 for an invalid safeTxHash value
      if (data?.code) {
        console.error("Gnosis signature error: " + data?.message)
        throw Error("Gnosis signature error: " + data?.message)
      }

      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Transaction queued to your Gnosis Safe",
      })
      return data
    } catch (err) {
      console.error(err)
      setToastState({
        isToastShowing: true,
        type: "error",
        err,
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

  const getContractVersion = async () => {
    const gnosisSafeDetails = await getGnosisSafeDetails(
      payment.data.token.chainId,
      payment.senderAddress
    )
    if (!gnosisSafeDetails?.version) {
      console.error("Could not retrieve Safe contract version for: " + payment.senderAddress)
      throw Error("Could not retrieve Safe contract version for: " + payment.senderAddress)
    }
    return gnosisSafeDetails.version
  }

  return { signMessage }
}

export default useGnosisSignatureToConfirmTransaction
