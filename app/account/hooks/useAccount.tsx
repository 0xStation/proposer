import { useQuery } from "@blitzjs/rpc"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import getAccountByAddress from "../queries/getAccountByAddress"

export const useAccount = (address) => {
  const [account, { isLoading }] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(address) },
    {
      enabled: !!address,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return { account, isLoading }
}
