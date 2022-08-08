import { useBalance } from "wagmi"
import { BigNumber } from "@ethersproject/bignumber"
import { useQuery } from "blitz"
import getAggregatedCheckAmounts from "app/check/queries/getAggregatedCheckAmounts"
import { ZERO_ADDRESS } from "../utils/constants"
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
    ...(!!tokenAddress && tokenAddress !== ZERO_ADDRESS && { token: tokenAddress }), // if tokenAddress is zero address, use gas token (e.g. ETH)
  })
  const balance = data?.value || BigNumber.from(0)
  const decimals = data?.decimals || 0

  // db stores check amounts as decimal so need to remultiply by token's number of decimals
  const pending = decimalToBigNumber(aggregatedCheckTotals?.pending || 0, decimals)
  const cashed = decimalToBigNumber(aggregatedCheckTotals?.cashed || 0, decimals)

  return {
    pending,
    cashed,
    available: balance.sub(pending),
    total: balance.add(cashed),
    decimals: decimals,
  }
}

export default useCheckbookFunds
