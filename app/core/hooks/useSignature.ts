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
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Signature denied",
      })
    }
  }

  return { signMessage }
}

export default useSignature
