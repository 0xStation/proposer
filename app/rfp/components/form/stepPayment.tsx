import { useSession } from "@blitzjs/auth"
import { useEffect, useState } from "react"
import ImportTokenModal from "app/core/components/ImportTokenModal"
import useStore from "app/core/hooks/useStore"
import { ProposalFormStep, PAYMENT_TERM_MAP, PAYMENT_DIRECTION_MAP } from "app/core/utils/constants"
import { Field } from "react-final-form"
import {
  composeValidators,
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
import { PaymentDirection } from "app/rfp/types"

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export const RfpFormStepPayment = ({
  chainId,
  selectedToken,
  setSelectedToken,
  selectedPaymentDirection,
  setSelectedPaymentDirection,
  selectedPaymentTerms,
  setSelectedPaymentTerms,
  tokenOptions,
  refetchTokens,
  isImportTokenModalOpen,
  setIsImportTokenModalOpen,
  setProposalStep,
}) => {
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const { hasMounted } = useHasMounted()

  useEffect(() => {
    // if user's wallet isn't connected redirect back to the first step
    // the reward form relies on the active chain to determine which tokens
    // to pull from
    if (hasMounted && (!activeUser?.address || !session?.siwe?.address)) {
      setProposalStep(ProposalFormStep.PROPOSE)
    }
  }, [activeUser?.address, session?.siwe?.address, hasMounted])

  return (
    <>
      <ImportTokenModal
        isOpen={isImportTokenModalOpen}
        setIsOpen={setIsImportTokenModalOpen}
        chainId={chainId?.toString()}
        // refetches the tokens in the new proposal form token dropdown
        callback={() => refetchTokens(true)}
      />

      {/* PAYMENT DIRECTION */}
      <div className="flex flex-col mt-6">
        <label className="font-bold block">Are you distributing or receiving payment?*</label>
        {/* <span className="text-xs text-concrete block"></span> */}
      </div>
      <Field name="paymentDirection" validate={requiredField}>
        {({ meta, input }) => (
          <>
            <div className="custom-select-wrapper">
              <select
                {...input}
                required
                className="w-full bg-wet-concrete rounded p-2 mt-1"
                value={selectedPaymentDirection}
                onChange={(e) => {
                  setSelectedPaymentDirection(e.target.value)
                  // custom values can be compatible with react-final-form by calling
                  // the props.input.onChange callback
                  // https://final-form.org/docs/react-final-form/api/Field
                  input.onChange(e.target.value)
                }}
              >
                <option value="">Choose option</option>
                <option value={PaymentDirection.AUTHOR_IS_SENDER}>
                  {PAYMENT_DIRECTION_MAP[PaymentDirection.AUTHOR_IS_SENDER]?.copy}
                </option>
                <option value={PaymentDirection.AUTHOR_IS_RECIPIENT}>
                  {PAYMENT_DIRECTION_MAP[PaymentDirection.AUTHOR_IS_RECIPIENT]?.copy}
                </option>
              </select>
            </div>
          </>
        )}
      </Field>
      {!!selectedPaymentDirection && (
        <>
          {/* TOKEN */}
          <div className="flex flex-col mt-6">
            <label className="font-bold block">Reward token*</label>
            {/* <span className="text-xs text-concrete block"></span> */}
          </div>
          <Field name="tokenAddress" validate={requiredField}>
            {({ input, meta }) => {
              return (
                <>
                  <div className="custom-select-wrapper">
                    <select
                      // if network is selected make the token address field required.
                      required
                      {...input}
                      className="w-full bg-wet-concrete rounded p-2 mt-1"
                      value={selectedToken?.address as string}
                      onChange={(e) => {
                        const selectedToken = tokenOptions.find((token) =>
                          addressesAreEqual(token.address, e.target.value)
                        )
                        setSelectedToken(selectedToken || {})
                        // custom values can be compatible with react-final-form by calling
                        // the props.input.onChange callback
                        // https://final-form.org/docs/react-final-form/api/Field
                        input.onChange(selectedToken?.address)
                      }}
                    >
                      <option value="">Choose option</option>
                      {tokenOptions?.map((token) => {
                        return (
                          <option key={token?.address} value={token?.address}>
                            {token?.symbol}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  {meta.touched && meta.error && (
                    <span className="text-torch-red text-xs">{meta.error}</span>
                  )}
                </>
              )
            }}
          </Field>
          <div className="flex flex-row justify-between">
            <span className="text-xs text-concrete block">
              {" "}
              Don&apos;t see your token? Import an ERC-20 with its address.
            </span>
            <button
              className="text-electric-violet cursor-pointer flex justify-start"
              onClick={(e) => {
                e.preventDefault()
                return !session.siwe?.address
                  ? toggleWalletModal(true)
                  : setIsImportTokenModalOpen(true)
              }}
            >
              + Import
            </button>
          </div>
          {/* PAYMENT AMOUNT */}
          <label className="font-bold block mt-6">Payment per proposal*</label>
          {/* <span className="text-xs text-concrete block"></span> */}
          <WhenFieldChanges
            field="tokenAddress"
            set="paymentAmount"
            // need to change to field value to empty string so form field validation is triggered
            // with new decimal number validation. The ideal state is to keep the paymentAmount field
            // value the same but the decimal amount isn't being update correctly for the validation.
            // Another option would be to validate on submit, although it doesn't follow the validation pattern.
            to={""}
          />
          <Field
            name="paymentAmount"
            format={formatTokenAmount}
            validate={
              // only validate decimals if a token is selected
              Boolean(selectedToken?.address)
                ? composeValidators(
                    requiredField,
                    isPositiveAmount,
                    isValidTokenAmount(selectedToken?.decimals || 0)
                  )
                : requiredField
            }
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
          {/* PAYMENT TERMS */}
          <label className="font-bold block mt-6">Payment terms*</label>
          {/* <span className="text-xs text-concrete block"></span> */}
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

export default RfpFormStepPayment
