import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { useNetwork, useSwitchNetwork } from "wagmi"

export const SwitchNetworkView = ({
  setIsOpen,
  isLoading,
  setIsLoading,
  chainId,
  switchNetwork,
}) => {
  return (
    <div>
      <h3 className="text-2xl font-bold pt-6">Change network to continue</h3>
      <p className="mt-2">You are connected to the wrong network! Click below to switch neworks.</p>
      <div className="mt-8">
        <Button
          className="mr-2"
          type={ButtonType.Secondary}
          onClick={() => {
            setIsOpen(false)
            setIsLoading(false)
          }}
        >
          Cancel
        </Button>
        <Button
          className="mb-8"
          isLoading={isLoading}
          isDisabled={isLoading}
          isSubmitType={true}
          onClick={() => switchNetwork?.(chainId)}
        >
          Switch
        </Button>
      </div>
    </div>
  )
}

export default SwitchNetworkView
