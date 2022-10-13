import useStore from "app/core/hooks/useStore"
import { useSignTypedData } from "wagmi"

const useSignature = () => {
  const setToastState = useStore((state) => state.setToastState)

  let { signTypedDataAsync } = useSignTypedData()

  const signMessage = async (message) => {
    // prompt the Metamask signature modal
    try {
      const signature = await signTypedDataAsync(message)
      return signature
    } catch (e) {
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
      throw Error(message)
    }
  }

  return { signMessage }
}

export default useSignature
