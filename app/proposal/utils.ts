import { MILESTONE_COPY, PAYMENT_TERM_MAP } from "app/core/utils/constants"
import { PaymentTerm } from "app/proposalPayment/types"

export const generateMilestonePayments = (
  senderAddress,
  recipientAddress,
  token,
  chainId,
  paymentAmount,
  paymentTerms,
  advancePaymentPercentage
) => {
  let milestones: any[] = []
  let payments: any[] = []
  // if payment details are present, populate milestone and payment objects
  // supports payment and non-payment proposals
  if (
    ![PaymentTerm.ON_AGREEMENT, PaymentTerm.AFTER_COMPLETION, PaymentTerm.ADVANCE_PAYMENT].some(
      (term) => term === paymentTerms
    )
  ) {
    throw Error("Missing payment terms.")
  }

  const tokenTransferBase = {
    senderAddress,
    recipientAddress,
    token: { ...token, chainId },
  }

  if (paymentTerms === PaymentTerm.ADVANCE_PAYMENT) {
    // if pay on proposal completion and non-zero advance payment, set up two milestones and two payments
    milestones = [
      {
        index: 0,
        title: MILESTONE_COPY.ADVANCE_PAYMENT,
      },
      {
        index: 1,
        title: MILESTONE_COPY.COMPLETION_PAYMENT,
      },
    ]

    const advancedPayment = (parseFloat(paymentAmount) * parseFloat(advancePaymentPercentage)) / 100
    const completionPayment = parseFloat(paymentAmount) - advancedPayment

    payments = [
      {
        ...tokenTransferBase,
        milestoneIndex: 0,
        amount: advancedPayment,
      },
      {
        ...tokenTransferBase,
        milestoneIndex: 1,
        amount: completionPayment,
      },
    ]
  } else {
    // there is only one payment, conditional on whether message is Advance or Completion
    milestones = [
      {
        index: 0,
        title:
          paymentTerms === PaymentTerm.ON_AGREEMENT
            ? MILESTONE_COPY.UPFRONT_PAYMENT
            : MILESTONE_COPY.COMPLETION_PAYMENT, // if terms are not ON_ARGEEMENT, they are AFTER_COMPLETION
      },
    ]
    payments = [
      {
        ...tokenTransferBase,
        milestoneIndex: 0,
        amount: parseFloat(paymentAmount),
      },
    ]
  }
  return { milestones, payments }
}

export const paymentTermsString = (terms, advancePaymentPercentage) => {
  return !terms
    ? "Flexible"
    : PAYMENT_TERM_MAP[terms]?.copy +
        (terms === PaymentTerm.ADVANCE_PAYMENT ? ` (${advancePaymentPercentage}%)` : "")
}
