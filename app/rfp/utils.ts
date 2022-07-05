import { RfpStatus } from "app/rfp/types"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"

export const computeRfpDbStatusFilter = (status: string) => {
  if (status === RfpStatus.DRAFT) {
    return {
      status: PrismaRfpStatus.DRAFT,
    }
  } else if (status === RfpStatus.DELETED) {
    return {
      status: PrismaRfpStatus.DELETED,
    }
  } else if (status === RfpStatus.STARTING_SOON) {
    return {
      status: PrismaRfpStatus.PUBLISHED,
      startDate: { gt: new Date() }, // (start date > now) implies RFP is not open yet
    }
  } else if (status === RfpStatus.OPEN_FOR_SUBMISSIONS) {
    return {
      status: PrismaRfpStatus.PUBLISHED,
      startDate: { lte: new Date() }, // (start date <= now) implies RFP has been open
      endDate: { gt: new Date() }, // (end date > now) implies RFP is not closed yet
    }
  } else if (status === RfpStatus.CLOSED) {
    return {
      status: PrismaRfpStatus.PUBLISHED,
      endDate: { lte: new Date() }, // (end date <= now) implies RFP is closed
    }
  } else {
    return {}
  }
}

export const computeRfpProductStatus = (status: string, startDate: Date, endDate: Date | null) => {
  if (status === PrismaRfpStatus.DRAFT) {
    return RfpStatus.DRAFT
  } else if (status === PrismaRfpStatus.DELETED) {
    return RfpStatus.DELETED
  } else if (new Date() < startDate && ((!!endDate && new Date() < endDate) || !endDate)) {
    // new Date() < endDate: check if RFP is closed.
    return RfpStatus.STARTING_SOON
  } else if (!!endDate && new Date() > endDate) {
    return RfpStatus.CLOSED
  } else {
    return RfpStatus.OPEN_FOR_SUBMISSIONS
    // last option is between start and end
  }
}