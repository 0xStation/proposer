import { Schedule as PrismaSchedule } from "@prisma/client"
import { Token } from "app/token/types"
import { CheckMetadata, CheckType } from "app/check/types"

export type Schedule = PrismaSchedule & {
  data: ScheduleMetadata
}

export type ScheduleMetadata = CheckMetadata & {
  startDate: Date
  periodCoefficient: number // integer
  periodUnit: SchedulePeriodUnit
  maxCount?: number // undefined if schedule is ongoing
}

export enum SchedulePeriodUnit {
  MINUTE = "MINUTE", // for testing
  WEEK = "WEEK",
  MONTH = "MONTH",
}

export enum ScheduleEnds {
  NEVER = "NEVER",
  AFTER_CYCLES = "AFTER_CYCLES",
}
