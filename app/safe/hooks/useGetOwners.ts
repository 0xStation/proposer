import { useContractRead } from "wagmi"
import safeABI from "app/contracts/abi/GnosisSafe.json"

export const useGetOwners = ({ chainId, safeAddress }) => {
  const response = useContractRead({
    chainId: chainId,
    address: safeAddress,
    abi: safeABI,
    functionName: "getOwners",
  })

  console.log("owners", response)

  return response?.data || false
}
