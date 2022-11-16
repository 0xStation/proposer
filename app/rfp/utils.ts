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
