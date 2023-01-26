import { ScheduleRepeatPeriod } from "./types"

export const calculateNextRefreshTime = ({
  frequency,
  period,
  lastRefreshedAt,
}: {
  frequency: number
  period: ScheduleRepeatPeriod
  lastRefreshedAt: Date
}): Date => {
  let delay: number
  if (period === ScheduleRepeatPeriod.MINUTES) {
    delay = 1000 * 60 * frequency
  } else if (period === ScheduleRepeatPeriod.WEEKS) {
    delay = 1000 * 60 * 60 * 24 * 7 * frequency
  } else if (period === ScheduleRepeatPeriod.MONTHS) {
    // TODO: fix this to jump months appropriately taking into account 28/30/31 days in a month
    delay = 1000 * 60 * 60 * 24 * 30 * frequency
  } else {
    console.log("delay is zero")
    delay = 0
  }
  return new Date(lastRefreshedAt.valueOf() + delay)
}
