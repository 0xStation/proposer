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
import { getPaymentAmountDetails, paymentDetailsString } from "app/rfp/utils"
import { PaymentAmountType } from "app/rfp/types"
import { toTitleCase } from "app/core/utils/titleCase"
import { useNetwork } from "wagmi"
import { getNetworkName } from "app/core/utils/networkInfo"
import { paymentTermsString } from "app/proposal/utils"

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export const RfpProposalFormStepReward = ({
  selectedPaymentTerms,
  setSelectedPaymentTerms,
  tokenOptions,
  isImportTokenModalOpen,
  selectedToken,
  setTokenOptions,
  setIsImportTokenModalOpen,
  setSelectedToken,
  chainId,
  refetchTokens,
}) => {
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)

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
      staleTime: 60 * 1000, // 1 minute
    }
  )

  const { type: paymentAmountType, amount: paymentAmount } = getPaymentAmountDetails(
    rfp?.data?.proposal?.payment?.minAmount,
    rfp?.data?.proposal?.payment?.maxAmount
  )

  return (
    <>
      {!!rfp?.data?.proposal.payment && (
        <div className="flex flex-col mt-6 pb-6 border-b border-wet-concrete space-y-6">
          {rfp?.data?.proposal?.payment?.token && (
            <>
              {/* NETWORK */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Network</h4>
                <p className="mt-2">
                  {getNetworkName(rfp?.data?.proposal?.payment?.token?.chainId)}
                </p>
              </div>
              {/* PAYMENT TOKEN */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Payment token</h4>
                <p className="mt-2">{rfp?.data?.proposal?.payment?.token?.symbol}</p>
              </div>
            </>
          )}
          {paymentAmountType !== PaymentAmountType.FLEXIBLE && (
            <>
              {/* PAYMENT AMOUNT */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Payment amount</h4>
                <p className="mt-2">{paymentDetailsString(paymentAmountType, paymentAmount)}</p>
              </div>
            </>
          )}
          {rfp?.data?.proposal?.payment?.terms && (
            <>
              {/* PAYMENT TERMS */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Payment terms</h4>
                <p className="mt-2">
                  {paymentTermsString(
                    rfp?.data?.proposal?.payment?.terms,
                    rfp?.data?.proposal?.payment?.advancePaymentPercentage
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      )}
      {!rfp?.data?.proposal?.payment?.token && (
        <>
          <ImportTokenModal
            isOpen={isImportTokenModalOpen}
            setIsOpen={setIsImportTokenModalOpen}
            chainId={chainId.toString()}
            // refetches the tokens in the new proposal form token dropdown
            callback={() => refetchTokens()}
          />

          {/* TOKEN */}
          <div className="flex flex-col mt-6">
            <label className="font-bold block">Reward token*</label>
            <span className="text-xs text-concrete block">
              Please select a network before you select a token.
            </span>
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
                        const token = tokenOptions.find((token) =>
                          addressesAreEqual(token.address, e.target.value)
                        )
                        setSelectedToken(token)
                        // custom values can be compatible with react-final-form by calling
                        // the props.input.onChange callback
                        // https://final-form.org/docs/react-final-form/api/Field
                        input.onChange(token?.address)
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
        </>
      )}
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
                name="advancePaymentPercentage"
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
