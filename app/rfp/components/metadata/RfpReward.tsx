import { getPaymentAmountDetails, rewardString } from "app/rfp/utils"

export const RfpReward = ({ rfpProposalPayment }) => {
  const { type: paymentAmountType, amount: paymentAmount } = getPaymentAmountDetails(
    rfpProposalPayment?.minAmount,
    rfpProposalPayment?.maxAmount
  )
  return (
    <div>
      <h4 className="text-xs font-bold text-concrete uppercase">Reward</h4>
      <p className="mt-2 text-lg font-bold">
        {rewardString(rfpProposalPayment?.token, paymentAmountType, paymentAmount)}
      </p>
    </div>
  )
}

export default RfpReward
