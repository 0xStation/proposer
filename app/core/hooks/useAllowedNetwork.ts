import { useNetwork } from "wagmi"
import useStore from "app/core/hooks/useStore"

const useAllowedNetwork = () => {
  const setToastState = useStore((state) => state.setToastState)
  const { chain: activeChain } = useNetwork()

  if (!!activeChain?.id && activeChain?.id != 4 && activeChain?.id != 1337) {
    const error = "Invalid chain selected. Please select Rinkeby or Localhost"
    console.error(error)
    setToastState({
      isToastShowing: true,
      type: "error",
      message: error,
    })

    return {
      chainId: activeChain?.id as number,
      error,
    }
  }

  return { chainId: activeChain?.id as number, error: null }
}

export default useAllowedNetwork
