import db from "db"
import * as z from "zod"
import { RfpStatus } from "app/rfp/types"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"

const GetRfpsByMultisigAddress = z.object({
  multisigAddress: z.string(),
  filterStatus: z.string().optional(),
})

const statusToFilter = (status: string) => {
  if (status === RfpStatus.DRAFT) {
    return {
      status: PrismaRfpStatus.DRAFT,
    }
  } else if (status === RfpStatus.ARCHIVED) {
    return {
      status: PrismaRfpStatus.ARCHIVED,
    }
  } else if (status === RfpStatus.STARTING_SOON) {
    return {
      status: PrismaRfpStatus.PUBLISHED,
      startDate: { gt: new Date() },
    }
  } else if (status === RfpStatus.OPEN_FOR_SUBMISSIONS) {
    return {
      status: PrismaRfpStatus.PUBLISHED,
      startDate: { lte: new Date() },
      endDate: { gt: new Date() },
    }
  } else if (status === RfpStatus.CLOSED) {
    return {
      status: PrismaRfpStatus.PUBLISHED,
      endDate: { lte: new Date() },
    }
  } else {
    return {}
  }
}

const computeStatus = (status: string, startDate: Date, endDate: Date | null) => {
  if (status === PrismaRfpStatus.DRAFT) {
    return RfpStatus.DRAFT
  } else if (status === PrismaRfpStatus.ARCHIVED) {
    return RfpStatus.ARCHIVED
  } else if (new Date() < startDate) {
    return RfpStatus.STARTING_SOON
  } else if (!!endDate && new Date() > endDate) {
    return RfpStatus.CLOSED
  } else {
    return RfpStatus.OPEN_FOR_SUBMISSIONS
    // last option is between start and end
  }
}

export default async function getRfpsByMultisigAddress(
  input: z.infer<typeof GetRfpsByMultisigAddress>
) {
  let filter = {
    parentMultisig: input.multisigAddress,
    ...(input.filterStatus && statusToFilter(input.filterStatus)),
  }

  const rfps = await db.rfp.findMany({
    where: filter,
  })

  return rfps.map((rfp) => {
    return {
      ...rfp,
      status: computeStatus(rfp.status, rfp.startDate, rfp.endDate),
    }
  })
}
