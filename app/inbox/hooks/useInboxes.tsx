import { useQuery } from "@blitzjs/rpc"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import getInboxes from "../queries/getInboxes"

export const useInboxes = (chainId: number, address: string) => {
  const [inboxes] = useQuery(
    getInboxes,
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

  return { inboxes }
}
