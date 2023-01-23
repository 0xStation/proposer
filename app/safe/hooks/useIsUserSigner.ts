import { useContractRead } from "wagmi"
import safeABI from "app/contracts/abi/GnosisSafe.json"

export const useIsUserSigner = ({ chainId, safeAddress, userAddress }) => {
  const isOwner = useContractRead({
    chainId: chainId,
    address: safeAddress,
    abi: safeABI,
    functionName: "isOwner",
    args: [userAddress],
    staleTime: 60_000,
  })

  return isOwner?.data || false
}
