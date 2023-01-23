import { useMutation, invoke } from "@blitzjs/rpc"
import useStore from "app/core/hooks/useStore"
import { getHash } from "app/signatures/utils"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { genGnosisTransactionDigest } from "app/signatures/gnosisTransaction"
import networks from "app/utils/networks.json"
import useSignature from "app/core/hooks/useSignature"
import { getSafeContractVersion } from "../utils/getSafeContractVersion"
import { ProposalPayment } from "app/proposalPayment/types"
import updateAccount from "app/account/mutations/updateAccount"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { createMoralisStream, getMoralisNetwork } from "app/core/libraries/moralis"
import { genGnosisPaymentDigest } from "app/signatures/gnosisPayment"

const useGnosisSignature = (payment: ProposalPayment) => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [updateAccountMutation] = useMutation(updateAccount)
  const { signMessage: signMessageHook } = useSignature()
  const signMessage = async () => {
    // prompt the Metamask signature modal
    try {
      const nonce = await getNonce()
      const contractVersion = await getSafeContractVersion(
        payment.data.token.chainId,
        payment.senderAddress
      )
      const transactionData = genGnosisPaymentDigest(payment, nonce, contractVersion)

      const signature = await signMessageHook(transactionData)
      const data = await createTransaction(signature, transactionData)

      // success case returns no code, failure returns code
      // only code returned in our experience so far is 1337 for an invalid safeTxHash value
      if (data?.code) {
        console.error("Gnosis signature error: " + data?.message)
        throw Error("Gnosis signature error: " + data?.message)
      }

      const account = await invoke(getAccountByAddress, {
        address: payment.senderAddress,
      })

      if (!account) {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Proposal client has no account.",
        })
        return data
      }

      if (!account.moralisStreamId) {
        const moralisStreamId = await createMoralisStream(
          payment.proposalId,
          getMoralisNetwork(payment.data.token.chainId),
          payment.senderAddress
        )

        // update the account to include the moralis stream
        await updateAccountMutation({
          address: payment.senderAddress,
          moralisStreamId,
        })
      }

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
    // only absolute urls supported
    const url = `https://safe-transaction-${network}.safe.global/api/v1/safes/${toChecksumAddress(
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
