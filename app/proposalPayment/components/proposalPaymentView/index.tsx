import { Proposal } from "app/proposal/types"
import { useState } from "react"
import TotalPaymentView from "./TotalPaymentView"
import { EditPaymentView } from "./EditPaymentView"

export const ProposalPaymentView = ({
  proposal,
  className,
}: {
  proposal?: Proposal
  className?: string
}) => {
  const [isEdit, setIsEdit] = useState<boolean>(false)

  return proposal ? (
    <>
      {isEdit ? (
        <EditPaymentView proposal={proposal} className={className} setIsEdit={setIsEdit} />
      ) : (
        <TotalPaymentView proposal={proposal} setIsEdit={setIsEdit} />
      )}
    </>
  ) : (
    <div className="h-[300px] bg-wet-concrete shadow rounded-2xl motion-safe:animate-pulse" />
  )
}

export default ProposalPaymentView
