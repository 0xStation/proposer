import { useMutation } from "@blitzjs/rpc"
import useStore from "app/core/hooks/useStore"
import { getHash } from "app/signatures/utils"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { genAddCheckbookDigest } from "app/checkbook/signature"
import networks from "app/utils/networks.json"
import useSignature from "app/core/hooks/useSignature"
import { getSafeContractVersion } from "app/core/utils/getSafeContractVersion"
import updateAccount from "app/account/mutations/updateAccount"

const useAddCheckbookToSafe = ({ chainId }: { chainId: number }) => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [updateAccountMutation] = useMutation(updateAccount)
  const { signMessage: signMessageHook } = useSignature()
  const signMessage = async (address) => {
    // prompt the Metamask signature modal
    try {
      const nonce = await getNonce(address)
      const contractVersion = await getSafeContractVersion(chainId, address)
      const message = genAddCheckbookDigest(chainId, address, nonce, contractVersion)

      const signature = await signMessageHook(message)
      const data = await createTransaction(address, signature, message)

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
      return null
    }
  }

  const createTransaction = async (address, signature, transactionData) => {
    const url = `https://safe-client.gnosis.io/v1/chains/${chainId}/transactions/${toChecksumAddress(
      address
    )}/propose`

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
      // success case returns no code, failure returns code
      // only code returned in our experience so far is 1337 for an invalid safeTxHash value
      if (data?.code) {
        console.error("Gnosis signature error: " + data?.message)
        throw Error("Gnosis signature error: " + data?.message)
      }

      return data
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const getNonce = async (address) => {
    const network = networks[chainId]?.gnosisNetwork
    if (!network) {
      throw Error("chainId not available on Gnosis")
    }
    // only absolute urls supported
    const url = `https://safe-transaction-${network}.safe.global/api/v1/safes/${toChecksumAddress(
      address
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

export default useAddCheckbookToSafe
