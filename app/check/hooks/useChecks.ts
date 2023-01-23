import { useQuery } from "@blitzjs/rpc"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import getChecks from "../queries/getChecks"

export const useChecks = (chainId: number, address: string, inboxIds: string[] = []) => {
  const [checks] = useQuery(
    getChecks,
    {
      chainId: chainId,
      address: toChecksumAddress(address),
      inboxIds,
    },
    {
      enabled: !!chainId && !!address,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return { checks }
}
