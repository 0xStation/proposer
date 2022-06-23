import { useBalance } from "wagmi"
import { BigNumber } from "ethers"
import { useQuery } from "blitz"
import getCheckGroupsForCheckbook from "app/check/queries/getCheckGroupsForCheckbook"

const useCheckbookFunds = (chainId: number, address: string, tokenAddress?: string) => {
  const [checks] = useQuery(
    getCheckGroupsForCheckbook,
    { checkbookAddress: address, tokenAddress: tokenAddress as string },
    { suspense: false, enabled: !!tokenAddress }
  )

  const { data } = useBalance({
    addressOrName: address,
    chainId,
    cacheTime: 10_000, // 10 seconds
    ...(!!tokenAddress && { token: tokenAddress }),
  })

  // query db for pending and cashed funds
  const pendingFunds = BigNumber.from(checks?.pending || 0)
  const cashedFunds = BigNumber.from(checks?.cashed || 0)

  return {
    pending: pendingFunds,
    cashed: cashedFunds,
    available: data?.value.sub(pendingFunds) || BigNumber.from(0),
    total: data?.value.add(cashedFunds) || BigNumber.from(0),
    decimals: data?.decimals || 0,
  }
}

export default useCheckbookFunds
