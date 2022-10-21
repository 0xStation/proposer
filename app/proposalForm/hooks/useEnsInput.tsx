import { useState } from "react"
import { useEnsAddress } from "wagmi"

export const useEnsInput = () => {
  const [addressInputVal, setAddressInputVal] = useState<string>()
  const { data: ensAddressResult } = useEnsAddress({
    name: addressInputVal,
    chainId: 1, // intentionally hardcoded to ethereum mainnet
    cacheTime: 60 * 1000, // 1 minute
  })

  return { addressInputVal, setAddressInputVal, ensAddressResult }
}

export default useEnsInput
