import { useEffect, useState } from "react"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { PAYMENT_TERM_MAP, SUPPORTED_CHAINS } from "app/core/utils/constants"
import { PaymentTerm } from "app/proposalPayment/types"
import { formatPercentValue, formatTokenAmount } from "app/utils/formatters"
import {
  composeValidators,
  isEnsOrAddress,
  isPositiveAmount,
  isValidAdvancedPaymentPercentage,
  isValidTokenAmount,
  requiredField,
} from "app/utils/validators"
import dynamic from "next/dynamic"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import { useSession } from "@blitzjs/auth"
import { ModuleBox } from "app/core/components/ModuleBox"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import getTokensByAccount from "app/token/queries/getTokensByAccount"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import { TokenType } from "@prisma/client"
import updatePayment from "app/proposalPayment/mutations/updatePayment"
import getProposalById from "app/proposal/queries/getProposalById"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"
import getProposalVersionsByProposalId from "app/proposalVersion/queries/getProposalVersionsByProposalId"

const ImportTokenModal = dynamic(() => import("app/core/components/ImportTokenModal"), {
  ssr: false,
})

const AnnotateProposalVersionModal = dynamic(
  () => import("app/proposalVersion/components/AnnotateProposalVersionModal")
)

export const EditPaymentView = ({ proposal, className, setIsEdit }) => {
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState<boolean>(false)
  const [isAnnotateModalOpen, setIsAnnotateModalOpen] = useState<boolean>(false)
  const setToastState = useStore((state) => state.setToastState)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const session = useSession({ suspense: false })
  const [selectedToken, setSelectedToken] = useState<any>(proposal?.data?.totalPayments?.[0]?.token)
  const [selectedChainId, setSelectedChainId] = useState<number>(
    proposal?.data?.totalPayments?.[0]?.token?.chainId
  )
  const [tokenOptions, setTokenOptions] = useState<any[]>()
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string>(
    proposal?.data?.paymentTerms
  )

  const [updatePaymentMutation] = useMutation(updatePayment)

  const [savedUserTokens, { refetch: refetchTokens }] = useQuery(
    getTokensByAccount,
    {
      chainId: selectedChainId || 1,
      userId: session?.userId as number,
    },
    { suspense: false, enabled: Boolean(selectedChainId && session?.userId) }
  )

  useEffect(() => {
    refetchTokens()
  }, [selectedChainId])

  useEffect(() => {
    const networkTokens = getNetworkTokens(selectedChainId || 1)
    // sets options for reward token dropdown. includes default tokens and
    // tokens that the user has imported to their account
    setTokenOptions([
      ...networkTokens,
      ...(savedUserTokens
        ?.filter((token) => token.chainId === selectedChainId)
        ?.filter((token) => token.type === TokenType.ERC20) || []),
    ])
  }, [savedUserTokens])

  const handleFormSubmit = async (values: any, annotationValue: any) => {
    try {
      setIsSubmitting(true)
      await updatePaymentMutation({
        proposalId: proposal?.id as string,
        token: tokenOptions?.find((token) => token?.address === values?.tokenAddress),
        amount: values.paymentAmount,
        paymentTerms: values.paymentTerms,
        advancePaymentPercentage:
          values.paymentTerms === PaymentTerm.ADVANCE_PAYMENT
            ? values.advancePaymentPercentage
            : "",
        proposalVersionAnnotation: annotationValue,
        recipientAddress: values.recipientAddress,
      })
      setIsSubmitting(false)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: `Successfully edited payment.`,
      })
      invalidateQuery(getProposalById)
      invalidateQuery(getProposalVersionsByProposalId)
      invalidateQuery(getRolesByProposalId)
      setIsAnnotateModalOpen(false)
      setIsEdit(false)
    } catch (err) {
      setIsSubmitting(false)
      setIsAnnotateModalOpen(false)
      console.error(err)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: `Error editing payment.`,
      })
    }
  }

  return (
    <ModuleBox isLoading={!proposal} className="mt-9">
      <Form
        initialValues={{
          network: proposal?.data?.totalPayments?.[0]?.token?.chainId,
          tokenAddress: proposal?.data?.totalPayments?.[0]?.token?.address,
          paymentAmount: proposal?.data?.totalPayments?.[0]?.amount?.toString(), // todo: fix token amount
          paymentTerms: proposal?.data?.paymentTerms,
          advancePaymentPercentage: proposal?.data?.advancePaymentPercentage?.toString(),
          recipientAddress: proposal?.payments?.[0]?.recipientAddress,
        }}
        onSubmit={async (values) => {
          setIsAnnotateModalOpen(true)
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <form onSubmit={handleSubmit}>
              <ImportTokenModal
                isOpen={isImportTokenModalOpen}
                setIsOpen={setIsImportTokenModalOpen}
                chainId={selectedChainId.toString()}
                // refetches the tokens in the new proposal form token dropdown
                callback={() => refetchTokens()}
              />
              <AnnotateProposalVersionModal
                isOpen={isAnnotateModalOpen}
                setIsOpen={setIsAnnotateModalOpen}
                isSubmitting={isSubmitting}
                handleSubmit={async (annotationValues) =>
                  await handleFormSubmit(formState.values, annotationValues)
                }
                title="Submitting changes to payment"
              />
              <div className="flex flex-row justify-between">
                <h3 className="font-bold text-concrete">Editing payment</h3>
                <div>
                  <Button
                    type={ButtonType.Secondary}
                    className="mr-3"
                    onClick={() => setIsEdit(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    isDisabled={!formState.dirty || isSubmitting}
                    type={ButtonType.Primary}
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                </div>
              </div>
              <div className="flex flex-col mt-6">
                <label className="font-bold block">Network</label>
                <span className="text-xs text-concrete block">
                  What network will the funds be deployed on?
                </span>
              </div>
              <Field name="network" validate={requiredField}>
                {({ input, meta }) => {
                  return (
                    <>
                      <div className="custom-select-wrapper">
                        <select
                          // if network is selected make the token address field required.
                          required
                          {...input}
                          className="w-full bg-wet-concrete rounded p-2 mt-1"
                          value={selectedChainId}
                          onChange={(e) => {
                            const selectedChain = SUPPORTED_CHAINS.find(
                              (chain) => chain?.id?.toString() === e.target.value
                            )
                            setSelectedChainId(selectedChain?.id as number)
                            // custom values can be compatible with react-final-form by calling
                            // the props.input.onChange callback
                            // https://final-form.org/docs/react-final-form/api/Field
                            input.onChange(selectedChain?.id)
                          }}
                        >
                          <option value="">Choose option</option>
                          {SUPPORTED_CHAINS?.map((chain) => {
                            return (
                              <option key={chain?.id} value={chain?.id}>
                                {chain?.name}
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

              <div className="flex flex-col mt-6">
                <label className="font-bold block">Payment</label>
                <span className="text-xs text-concrete block">
                  Payment will occur on your currently selected network{" "}
                  {SUPPORTED_CHAINS.find((chain) => chain?.id === selectedChainId)?.name}
                </span>
              </div>
              <div className="flex flex-row">
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
                      <div className="w-[70%] mr-3">
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
                <Field name="tokenAddress" validate={requiredField}>
                  {({ input, meta }) => {
                    return (
                      <>
                        <div className="w-[30%] custom-select-wrapper">
                          <select
                            // if network is selected make the token address field required.
                            required
                            {...input}
                            className="w-full bg-wet-concrete rounded p-2 mt-1"
                            value={selectedToken?.address as string}
                            onChange={(e) => {
                              const selectedToken = tokenOptions?.find((token) =>
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
              </div>
              <div className="flex flex-row justify-between mt-1">
                <span className="text-xs text-concrete block">
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
              {/* PAYMENT TERMS */}
              <label className="font-bold block mt-6">Payment terms</label>
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
                  <label className="font-bold block mt-6">Advance payment</label>
                  <span className="text-xs text-concrete block">
                    How much of the payment amount should the contributors expect to receive at
                    proposal approval to kickstart their project?
                  </span>
                  <WhenFieldChanges field="paymentTerms" set="advancePaymentPercentage" to={""} />
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
              <div className="hidden">
                <label className="font-bold block mt-6">Fund recipient</label>
                <span className="text-xs text-concrete block">
                  Who will be receiving the funds?
                </span>
                <Field
                  name="recipientAddress"
                  validate={composeValidators(requiredField, isEnsOrAddress)}
                >
                  {({ meta, input }) => {
                    return (
                      <>
                        <input
                          {...input}
                          type="text"
                          required
                          placeholder="Enter ENS name or wallet address"
                          className="bg-wet-concrete rounded-md w-full p-2 mt-1"
                        />
                        {meta.touched && meta.error && (
                          <span className="text-torch-red text-xs">{meta.error}</span>
                        )}
                      </>
                    )
                  }}
                </Field>
              </div>
            </form>
          )
        }}
      />
    </ModuleBox>
  )
}
