import { useEffect } from "react"
import { useBalance } from "wagmi"
import { BigNumber, utils } from "ethers"
import { useQuery, invoke } from "blitz"
import getAggregatedCheckAmounts from "app/check/queries/getAggregatedCheckAmounts"
import { ZERO_ADDRESS } from "../utils/constants"
import decimalToBigNumber from "../utils/decimalToBigNumber"
import { formatUnits } from "ethers/lib/utils"

const useCheckbookAvailable = (
  chainId: number,
  checkbookAddress: string,
  quorum: number,
  tokenAddresses: string[]
) => {
  const balances = tokenAddresses.reduce((acc, address) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useBalance({
      addressOrName: checkbookAddress,
      chainId,
      cacheTime: 10_000, // 10 seconds
      ...(!!address && address !== ZERO_ADDRESS && { token: address }), // if tokenAddress is zero address, use gas token (e.g. ETH)
    })

    const balance = data?.value || BigNumber.from(0)
    const decimals = data?.decimals || 0

    acc[address] = {
      balance,
      decimals,
    }
    return acc
  }, {})

  useEffect(() => {
    if (balances) {
      console.log(balances)
      const aggregatedCheckTotals = Promise.all(
        tokenAddresses.map(async (address) => {
          const totals = await invoke(getAggregatedCheckAmounts, {
            checkbookAddress,
            quorum: quorum,
            tokenAddress: address as string,
          })

          return {
            ...totals,
            address,
          }
        })
      )

      aggregatedCheckTotals.then((data) => {
        const map = data.map((total) => {
          let balanceObject = balances[total.address]
          console.log(balanceObject)
          const pending = decimalToBigNumber(total.pending || 0, balanceObject.decimals)
          const cashed = decimalToBigNumber(total.cashed || 0, balanceObject.decimals)

          return {
            cashed: formatUnits(cashed, balanceObject.decimals),
            pending: formatUnits(pending, balanceObject.decimals),
            available: formatUnits(balanceObject.balance.sub(pending), balanceObject.decimals),
            total: formatUnits(balanceObject.balance.add(cashed), balanceObject.decimals),
          }
        })

        console.log(map)
      })
    }
  }, [balances])
}

export default useCheckbookAvailable
