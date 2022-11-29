export const getMostRecentPaymentAttempt = (payment) => {
  return payment.data?.history?.[payment.data.history.length - 1]
}
