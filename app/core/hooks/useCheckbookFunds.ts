import { useBalance } from "wagmi"
import { BigNumber } from "ethers"
import { useQuery } from "blitz"
import getAggregatedCheckAmounts from "app/check/queries/getAggregatedCheckAmounts"

const useCheckbookFunds = (
  chainId: number,
  checkbookAddress: string,
  quorum: number,
  tokenAddress?: string
) => {
  const [aggregatedCheckTotals] = useQuery(
    getAggregatedCheckAmounts,
    { checkbookAddress, quorum: quorum, tokenAddress: tokenAddress as string },
    { suspense: false, enabled: !!tokenAddress }
  )

  const { data } = useBalance({
    addressOrName: checkbookAddress,
    chainId,
    cacheTime: 10_000, // 10 seconds
    ...(!!tokenAddress && { token: tokenAddress }), // if tokenAddress is empty string, use gas token (e.g. ETH)
  })

  // query db for pending and cashed funds
  const pending = BigNumber.from(aggregatedCheckTotals?.pending || 0)
  const cashed = BigNumber.from(aggregatedCheckTotals?.cashed || 0)

  return {
    pending,
    cashed,
    available: (data?.value || BigNumber.from(0)).sub(pending),
    total: (data?.value || BigNumber.from(0)).add(cashed),
    decimals: data?.decimals || 0,
  }
}

export default useCheckbookFunds
