import { Dispatch, SetStateAction } from "react"
import { getNetworkName } from "app/core/utils/networkInfo"
import { Proposal } from "app/proposal/types"
import { PAYMENT_TERM_MAP } from "app/core/utils/constants"
import { ProposalRoleType, ProposalStatus } from "@prisma/client"
import { Account } from "app/account/types"
import { formatCurrencyAmount } from "app/core/utils/formatCurrencyAmount"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import { ModuleBox } from "app/core/components/ModuleBox"
import { EditIconAndTooltip } from "app/core/components/EditIconAndTooltip"
import useStore from "app/core/hooks/useStore"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"

export const TotalPaymentView = ({
  proposal,
  setIsEdit,
  className,
}: {
  proposal?: Proposal
  setIsEdit: Dispatch<SetStateAction<boolean>>
  className?: string
}) => {
  const activeUser = useStore((state) => state.activeUser)
  const activeUserIsAuthor = proposal?.roles?.find(
    (role) => role.type === ProposalRoleType.AUTHOR && role.address === activeUser?.address
  )
  const { roles: activeUsersRoles } = useGetUsersRoles(proposal?.id as string)
  return (
    <ModuleBox isLoading={!proposal} className="mt-9">
      {activeUserIsAuthor ? (
        proposal?.status === ProposalStatus.DRAFT ||
        proposal?.status === ProposalStatus.AWAITING_APPROVAL ? (
          <EditIconAndTooltip
            disabled={false}
            editCopy="Edit payment"
            toolTipCopy="Only you as the author can edit your proposal."
            onClick={() => {
              setIsEdit(true)
            }}
          />
        ) : (
          <EditIconAndTooltip
            disabled={true}
            editCopy="Edit payment"
            toolTipCopy="You can only edit the proposal before approval."
          />
        )
      ) : (
        activeUsersRoles?.length > 0 && (
          <EditIconAndTooltip
            disabled={true}
            editCopy="Edit payment"
            toolTipCopy="Currently, only the author can edit the proposal."
          />
        )
      )}
      {/* NETWORK */}
      <h4 className="text-xs font-bold text-concrete uppercase mt-2">Network</h4>
      <p className="mt-2">
        {getNetworkName(proposal?.data?.totalPayments?.[0]?.token.chainId || 0)}
      </p>
      <div className="mt-6">
        <h4 className="text-xs font-bold text-concrete uppercase">Payment terms</h4>
        <p className="mt-2">{PAYMENT_TERM_MAP[proposal?.data?.paymentTerms || ""]?.copy}</p>
      </div>
      {proposal?.data.advancePaymentPercentage && (
        <div className="mt-6">
          <h4 className="text-xs font-bold text-concrete uppercase">Advance payment</h4>
          <p className="mt-2">{proposal?.data.advancePaymentPercentage.toString() + "%"}</p>
        </div>
      )}
      <div className="mt-6">
        <h4 className="text-xs font-bold text-concrete uppercase">Total payment</h4>
        <p className="mt-2">
          {formatCurrencyAmount(proposal?.data?.totalPayments?.[0]?.amount.toString()) +
            " " +
            proposal?.data?.totalPayments?.[0]?.token.symbol}
        </p>
      </div>
      <div className="mt-6">
        <h4 className="text-xs font-bold text-concrete uppercase mb-2">Fund recipient</h4>
        <AccountMediaObject
          account={
            proposal?.roles?.find((role) => role.type === ProposalRoleType.CONTRIBUTOR)
              ?.account as Account
          }
          showActionIcons={true}
        />
      </div>
    </ModuleBox>
  )
}

export default TotalPaymentView
