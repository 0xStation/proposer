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
