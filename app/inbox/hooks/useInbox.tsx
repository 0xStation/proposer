import { useQuery } from "@blitzjs/rpc"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import getInbox from "../queries/getInbox"
import getInboxes from "../queries/getInboxes"

export const useInbox = (inboxId: string) => {
  const [inbox] = useQuery(
    getInbox,
    {
      inboxId,
    },
    {
      enabled: !!inboxId,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return { inbox }
}
