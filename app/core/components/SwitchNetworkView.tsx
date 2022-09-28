import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { useSwitchNetwork } from "wagmi"
import useStore from "app/core/hooks/useStore"

export const SwitchNetworkView = ({ isLoading, setIsLoading, chainId }) => {
  const setToastState = useStore((state) => state.setToastState)
  const { switchNetworkAsync } = useSwitchNetwork()

  const switchNetwork = async (chainId: number) => {
    try {
      await switchNetworkAsync?.(chainId)
    } catch (e) {
      if (e.name === "UserRejectedRequestError") {
        // don't throw toast if user rejected network request
      } else if (e.name === "ConnectorNotFoundError") {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Wallet connection error, please disconnect and reconnect your wallet.",
        })
      } else {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Switching networks failed",
        })
      }
    }
    setIsLoading(false)
  }

  return (
    <div>
      <h3 className="text-2xl font-bold pt-6">Change network to continue</h3>
      <p className="mt-2">You are connected to the wrong network! Click below to switch neworks.</p>
      <div className="mt-8">
        <Button
          className="mb-8"
          isLoading={isLoading}
          isDisabled={isLoading}
          isSubmitType={true}
          onClick={() => {
            setIsLoading(true)
            switchNetwork(chainId)
          }}
        >
          Switch
        </Button>
      </div>
    </div>
  )
}

export default SwitchNetworkView
