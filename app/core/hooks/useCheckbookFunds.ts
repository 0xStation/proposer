import { useBalance } from "wagmi"
import { BigNumber, utils } from "ethers"
import { useQuery } from "blitz"
import getAggregatedCheckAmounts from "app/check/queries/getAggregatedCheckAmounts"
import { zeroAddress } from "../utils/constants"
import decimalToBigNumber from "../utils/decimalToBigNumber"

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
    ...(!!tokenAddress && tokenAddress !== zeroAddress && { token: tokenAddress }), // if tokenAddress is zero address, use gas token (e.g. ETH)
  })

  // db stores check amounts as decimal so need to remultiply by token's number of decimals
  const pending = decimalToBigNumber(aggregatedCheckTotals?.pending || 0, data?.decimals || 0)
  const cashed = decimalToBigNumber(aggregatedCheckTotals?.cashed || 0, data?.decimals || 0)

  return {
    pending,
    cashed,
    available: (data?.value || BigNumber.from(0)).sub(pending),
    total: (data?.value || BigNumber.from(0)).add(cashed),
    decimals: data?.decimals || 0,
  }
}

export default useCheckbookFunds
