import { useSession } from "@blitzjs/auth"
import { useEffect, useState } from "react"
import ImportTokenModal from "app/core/components/ImportTokenModal"
import useStore from "app/core/hooks/useStore"
import { ProposalFormStep, PAYMENT_TERM_MAP } from "app/core/utils/constants"
import { Field } from "react-final-form"
import {
  composeValidators,
  isNotAboveMaximum,
  isNotBelowMinimum,
  isPositiveAmount,
  isValidAdvancedPaymentPercentage,
  isValidTokenAmount,
  requiredField,
} from "app/utils/validators"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { formatPercentValue, formatTokenAmount } from "app/utils/formatters"
import { PaymentTerm } from "app/proposalPayment/types"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import useHasMounted from "app/core/hooks/useHasMounted"
import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import getRfpById from "app/rfp/queries/getRfpById"
import { getPaymentAmountDetails } from "app/rfp/utils"
import { PaymentAmountType } from "app/rfp/types"
import { toTitleCase } from "app/core/utils/titleCase"

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export const RfpProposalFormStepReward = ({ selectedPaymentTerms, setSelectedPaymentTerms }) => {
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const { hasMounted } = useHasMounted()

  const rfpId = useParam("rfpId") as string
  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId as string,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )

  const { type: paymentAmountType, amount: paymentAmount } = getPaymentAmountDetails(
    rfp?.data?.proposal?.payment?.minAmount,
    rfp?.data?.proposal?.payment?.maxAmount
  )

  return (
    <>
      {paymentAmountType !== PaymentAmountType.FIXED && (
        <>
          {/* PAYMENT AMOUNT */}
          <label className="font-bold block mt-6">Payment amount*</label>
          <span className="text-xs text-concrete block">
            {paymentAmountType === PaymentAmountType.MAXIMUM ||
            paymentAmountType === PaymentAmountType.MINIMUM
              ? `${toTitleCase(paymentAmountType)} amount allowed of ${paymentAmount}`
              : ""}
          </span>
          <Field
            name="paymentAmount"
            format={formatTokenAmount}
            validate={composeValidators(
              // TODO: validate against min/max data from rfp definition
              requiredField,
              isPositiveAmount,
              isValidTokenAmount(rfp?.data?.proposal?.payment?.token?.decimals || 0),
              isNotBelowMinimum(rfp?.data?.proposal?.payment?.minAmount),
              isNotAboveMaximum(rfp?.data?.proposal?.payment?.maxAmount)
            )}
          >
            {({ input, meta }) => {
              return (
                <div>
                  <input
                    {...input}
                    type="text"
                    className="w-full bg-wet-concrete rounded mt-1 p-2"
                    placeholder="0.00"
                  />
                  {meta.touched && meta.error && (
                    <span className="text-torch-red text-xs">{meta.error}</span>
                  )}
                </div>
              )
            }}
          </Field>
        </>
      )}
      {!rfp?.data?.proposal?.payment?.terms && (
        <>
          {/* PAYMENT TERMS */}
          <label className="font-bold block mt-6">Payment terms*</label>
          <span className="text-xs text-concrete block">
            When is the payment expected to be sent to contributors?
          </span>
          <Field name="paymentTerms" validate={requiredField}>
            {({ meta, input }) => (
              <>
                <div className="custom-select-wrapper">
                  <select
                    {...input}
                    required
                    className="w-full bg-wet-concrete rounded p-2 mt-1"
                    value={selectedPaymentTerms}
                    onChange={(e) => {
                      setSelectedPaymentTerms(e.target.value)
                      // custom values can be compatible with react-final-form by calling
                      // the props.input.onChange callback
                      // https://final-form.org/docs/react-final-form/api/Field
                      input.onChange(e.target.value)
                    }}
                  >
                    <option value="">Choose option</option>
                    <option value={PaymentTerm.ON_AGREEMENT}>
                      {PAYMENT_TERM_MAP[PaymentTerm.ON_AGREEMENT]?.copy}
                    </option>
                    <option value={PaymentTerm.AFTER_COMPLETION}>
                      {PAYMENT_TERM_MAP[PaymentTerm.AFTER_COMPLETION]?.copy}
                    </option>
                    <option value={PaymentTerm.ADVANCE_PAYMENT}>
                      {PAYMENT_TERM_MAP[PaymentTerm.ADVANCE_PAYMENT]?.copy}
                    </option>
                  </select>
                </div>
              </>
            )}
          </Field>
          {selectedPaymentTerms === PaymentTerm.ADVANCE_PAYMENT && (
            <>
              {/* ADVANCE PAYMENT */}
              <span className="text-xs text-concrete">
                Enter the percent of payment to be sent before work is to start.
              </span>
              <Field
                name="advancedPaymentPercentage"
                format={formatPercentValue}
                validate={composeValidators(requiredField, isValidAdvancedPaymentPercentage)}
              >
                {({ input, meta }) => {
                  return (
                    <div className="h-10 mt-1 w-full bg-wet-concrete text-marble-white mb-5 rounded">
                      <input
                        {...input}
                        type="text"
                        placeholder="0"
                        className="h-full p-2 inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white rounded"
                      />
                      <div className="py-2 px-4 w-[2%] inline h-full">%</div>
                      {meta.error && meta.touched && (
                        <span className="text-xs text-torch-red mt-2 block">{meta.error}</span>
                      )}
                    </div>
                  )
                }}
              </Field>
            </>
          )}
        </>
      )}
    </>
  )
}

export default RfpProposalFormStepReward
