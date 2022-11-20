import { RfpStatus } from "@prisma/client"
import { toTitleCase } from "app/core/utils/titleCase"
import { PaymentAmountType } from "./types"

export const getPaymentAmountDetails = (
  minAmount,
  maxAmount
): { type: PaymentAmountType; amount: string } => {
  let type
  let amount

  if (!minAmount && !maxAmount) {
    type = PaymentAmountType.FLEXIBLE
    amount = ""
  } else if (minAmount === maxAmount) {
    type = PaymentAmountType.FIXED
    amount = minAmount
  } else if (minAmount) {
    type = PaymentAmountType.MINIMUM
    amount = minAmount
  } else if (maxAmount) {
    type = PaymentAmountType.MAXIMUM
    amount = maxAmount
  }

  return {
    type,
    amount,
  }
}

export const paymentDetailsString = (type, amount) => {
  if (type === PaymentAmountType.FLEXIBLE) {
    return toTitleCase(PaymentAmountType.FLEXIBLE)
  } else if (type === PaymentAmountType.FIXED) {
    return amount
  } else if (type === PaymentAmountType.MINIMUM) {
    return "≥" + amount
  } else if (type === PaymentAmountType.MAXIMUM) {
    return "≤" + amount
  }
}

export const getRfpStatus = (dbStatus, startDate, endDate) => {
  if (dbStatus !== RfpStatus.TIME_DEPENDENT) {
    return dbStatus
  } else if (endDate && Date.now() > endDate) {
    return RfpStatus.CLOSED
  } else if (startDate && Date.now() < startDate) {
    return RfpStatus.CLOSED
  }
  return RfpStatus.OPEN
}

export const computeRfpDbStatusFilter = (status: RfpStatus) => {
  if (status === RfpStatus.OPEN) {
    return {
      OR: [
        {
          status: RfpStatus.OPEN,
        },
        {
          status: RfpStatus.TIME_DEPENDENT,
          OR: [
            {
              startDate: {
                equals: null,
              },
              endDate: {
                gte: new Date(),
              },
            },
            {
              startDate: {
                lte: new Date(),
              },
              endDate: {
                gte: new Date(),
              },
            },
            {
              startDate: {
                lte: new Date(),
              },
              endDate: {
                equals: null,
              },
            },
          ],
        },
      ],
    }
  } else if (status === RfpStatus.CLOSED) {
    return {
      OR: [
        {
          status: RfpStatus.CLOSED,
        },
        {
          status: RfpStatus.TIME_DEPENDENT,
          OR: [
            {
              startDate: {
                gt: new Date(),
              },
            },
            {
              endDate: {
                lt: new Date(),
              },
            },
          ],
        },
      ],
    }
  } else {
    return {}
  }
}
