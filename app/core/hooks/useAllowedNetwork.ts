import { useNetwork } from "wagmi"
import useStore from "app/core/hooks/useStore"

const useAllowedNetwork = () => {
  const setToastState = useStore((state) => state.setToastState)

  const { activeChain } = useNetwork()

  console.log("useAllowedNetwork", activeChain?.id)

  if (!!activeChain?.id && activeChain?.id != 4 && activeChain?.id != 1337) {
    console.error("Invalid chain selected. Please select Rinkeby or Localhost")
    setToastState({
      isToastShowing: true,
      type: "error",
      message: "Invalid network, switch to Rinkeby or Localhost.",
    })

    return {
      chainId: activeChain?.id as number,
      error: "Invalid network, switch to Rinkeby or Localhost",
    }
  }

  return { chainId: activeChain?.id as number, error: null }
}

export default useAllowedNetwork
