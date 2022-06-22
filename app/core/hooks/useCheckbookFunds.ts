import { useBalance } from "wagmi"
import { BigNumber } from "ethers"
import { formatUnits } from "ethers/lib/utils"

const useCheckbookFunds = (chainId: number, address: string, tokenAddress?: string) => {
  const { data } = useBalance({
    addressOrName: address,
    chainId,
    cacheTime: 10_000, // 10 seconds
    ...(!!tokenAddress && { token: tokenAddress }),
  })

  // query db for pending and cashed funds
  const pendingFunds = BigNumber.from(0)
  const cashedFunds = BigNumber.from(0)

  return {
    pending: pendingFunds,
    cashed: cashedFunds,
    available: data?.value.sub(pendingFunds) || BigNumber.from(0),
    total: data?.value.add(cashedFunds) || BigNumber.from(0),
    decimals: data?.decimals || 0,
  }
}

export default useCheckbookFunds
