import { useQuery } from "@blitzjs/rpc"
import getCheck from "../queries/getCheck"

export const useCheck = (checkId: string) => {
  const [check] = useQuery(
    getCheck,
    {
      checkId,
    },
    {
      enabled: !!checkId,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return { check }
}
