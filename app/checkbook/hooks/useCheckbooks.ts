import { useQuery } from "@blitzjs/rpc"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import getCheckbooks from "../queries/getCheckbooks"

export const useCheckbooks = (ids: { chainId: number; address: string }[]) => {
  const [checkbooks] = useQuery(
    getCheckbooks,
    {
      ids: ids.map(({ chainId, address }) => {
        return { chainId, address: toChecksumAddress(address) }
      }),
    },
    {
      // enabled: ids.length > 0,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  return { checkbooks }
}
