import { useQuery } from "@blitzjs/rpc"
import getSchedule from "../queries/getSchedule"

export const useSchedule = (scheduleId: string) => {
  const [schedule] = useQuery(
    getSchedule,
    {
      scheduleId,
    },
    {
      enabled: !!scheduleId,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return { schedule }
}
