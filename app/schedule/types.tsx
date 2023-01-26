import { Schedule as PrismaSchedule } from "@prisma/client"
import { Token } from "app/token/types"
import { CheckMetadata, CheckType } from "app/check/types"

export type Schedule = PrismaSchedule & {
  data: ScheduleMetadata
}

export type ScheduleMetadata = CheckMetadata & {
  startDate: Date
  repeatFrequency: number
  repeatPeriod: ScheduleRepeatPeriod
  maxCount?: number
}

export enum ScheduleRepeatPeriod {
  MINUTES = "minute(s)", // for testing
  WEEKS = "week(s)",
  MONTHS = "month(s)",
}

export enum ScheduleEnds {
  NEVER = "NEVER",
  AFTER_CYCLES = "AFTER_CYCLES",
}
