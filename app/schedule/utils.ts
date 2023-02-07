import { SchedulePeriodUnit } from "./types"

export const calculateNextRefreshTime = ({
  periodCoefficient,
  periodUnit,
  lastRefreshMarker,
}: {
  periodCoefficient: number
  periodUnit: SchedulePeriodUnit
  lastRefreshMarker: Date
}): Date => {
  let delay: number
  if (periodUnit === SchedulePeriodUnit.MINUTE) {
    delay = periodCoefficient * 1000 * 60
  } else if (periodUnit === SchedulePeriodUnit.WEEK) {
    delay = periodCoefficient * 1000 * 60 * 60 * 24 * 7
  } else if (periodUnit === SchedulePeriodUnit.MONTH) {
    // TODO: fix this to jump months appropriately taking into account 28/30/31 days in a month
    delay = periodCoefficient * 1000 * 60 * 60 * 24 * 30
  } else {
    console.log("delay is zero")
    delay = 0
  }
  // if schedule has no last refresh marker, next refresh is start date
  return new Date(lastRefreshMarker.valueOf() + delay)
}
