import { useQuery } from "@blitzjs/rpc"
import getRfpById from "../queries/getRfpById"

export const useRfp = (rfpId) => {
  const [rfp, { isLoading }] = useQuery(
    getRfpById,
    {
      id: rfpId as string,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )
  return { rfp, isLoading }
}
