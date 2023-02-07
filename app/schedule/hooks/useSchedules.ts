import { useQuery } from "@blitzjs/rpc"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import getSchedules from "../queries/getSchedules"

export const useSchedules = (chainId: number, address: string) => {
  const [schedules] = useQuery(
    getSchedules,
    {
      chainId: chainId,
      address: toChecksumAddress(address),
    },
    {
      enabled: !!chainId && !!address,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return { schedules }
}
