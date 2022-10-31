import { useEffect, useState } from "react"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import { BlitzPage, GetServerSideProps, getSession, useQuery, useSession } from "blitz"
import Layout from "app/core/layouts/Layout"
import { PAYMENT_TERM_MAP } from "app/core/utils/constants"
import { Field, Form } from "react-final-form"
import Button from "app/core/components/sds/buttons/Button"
import {
  composeValidators,
  isEnsOrAddress,
  isPositiveAmount,
  isValidAdvancedPaymentPercentage,
  isValidTokenAmount,
  requiredField,
} from "app/utils/validators"
import useStore from "app/core/hooks/useStore"
import useHasMounted from "app/core/hooks/useHasMounted"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import { formatPercentValue, formatTokenAmount } from "app/utils/formatters"
import { PaymentTerm } from "app/proposalPayment/types"
import { debounce } from "@mui/material"
import useEnsInput from "app/proposalForm/hooks/useEnsInput"
import { EnsAddressMetadataText } from "app/proposalForm/components/EnsAddressMetadataText"
import { useNetwork } from "wagmi"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import getTokensByNetwork from "app/token/queries/getTokensByNetwork"
import ImportTokenModal from "app/core/components/ImportTokenModal"

// server side authenticate user is a Station admin
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res)
  const stationAdmins = [
    "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB", // paprika
    "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13", // rie
    "0xBb398Fd83126500E3f0afec6d4c69411576bc7FB", // jpeg
    "0x78918036a8e4B9179bEE3CAB57110A3397986E44", // pixels
    "0x016562aA41A8697720ce0943F003141f5dEAe006", // symmetry
    "0x65A3870F48B5237f27f674Ec42eA1E017E111D63", // frog
  ]

  if (!stationAdmins.includes(session?.siwe?.address || "")) {
    return {
      redirect: {
        destination: `/explore`,
        permanent: false,
      },
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
}

const RfpNewInternal: BlitzPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const { hasMounted } = useHasMounted()

  //   Propose form
  const { setAddressInputVal: setClientAddressInputVal, ensAddressResult: clientEnsAddressResult } =
    useEnsInput()
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const {
    setAddressInputVal: setContributorAddressInputVal,
    ensAddressResult: contributorEnsAddressResult,
  } = useEnsInput()

  const handleEnsAddressInputValOnKeyUp = (val, setValToCheckEns) => {
    const fieldVal = val.trim()
    // if value is already an address, we don't need to check for ens
    if (ethersIsAddress(fieldVal)) return

    // set state input val to update ens address
    setValToCheckEns(fieldVal)
  }

  // Reward form
  const { chain } = useNetwork()
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<any>()
  const [tokenOptions, setTokenOptions] = useState<any[]>([])
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string>("")
  const [selectedSubmissionToken, setSelectedSubmissionToken] = useState<any>()

  useEffect(() => {
    if (chain?.id) {
      const networkTokens = getNetworkTokens(chain?.id || 1)
      // sets options for reward token dropdown. includes default tokens and
      // tokens that the user has imported to their account
      setTokenOptions([...networkTokens, ...(tokens || [])])
    }
  }, [chain?.id])

  const [tokens, { refetch: refetchTokens }] = useQuery(
    getTokensByNetwork,
    {
      chainId: chain?.id || 1,
    },
    { enabled: Boolean(chain && session?.userId) }
  )

  return (
    <Layout>
      <ImportTokenModal
        isOpen={isImportTokenModalOpen}
        setIsOpen={setIsImportTokenModalOpen}
        chainId={chain?.id?.toString()}
        // refetches the tokens in the new proposal form token dropdown
        callback={() => refetchTokens()}
      />
      <div className="mx-16 mt-16">
        <h1 className="text-2xl font-bold">Create a new RFP</h1>
        <Form
          initialValues={{}}
          onSubmit={async (values) => {}}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className="max-w-lg mr-5 sm:mr-0">
                {/* TITLE */}
                <label className="font-bold block mt-6">Title*</label>
                <Field name="title" validate={requiredField}>
                  {({ meta, input }) => (
                    <>
                      <input
                        {...input}
                        type="text"
                        required
                        placeholder="Add a title for your idea"
                        className="bg-wet-concrete rounded mt-1 w-full p-2"
                      />

                      {meta.touched && meta.error && (
                        <span className="text-torch-red text-xs">{meta.error}</span>
                      )}
                    </>
                  )}
                </Field>
                {/* SUBMISSION GUIDELINES */}
                <label className="font-bold block mt-6">Submission guidelines*</label>
                <Field name="submissionGuidelines" component="textarea">
                  {({ input, meta }) => (
                    <div>
                      <textarea
                        {...input}
                        rows={6}
                        placeholder="Describe your ideas, detail the value you aim to deliver, and link any relevant documents."
                        className="mt-2 bg-wet-concrete text-marble-white p-2 rounded w-full"
                      />
                      {/* this error shows up when the user focuses the field (meta.touched) */}
                      {meta.error && meta.touched && (
                        <span className=" text-xs text-torch-red block">{meta.error}</span>
                      )}
                    </div>
                  )}
                </Field>
                {/* ACCOUNT ADDRESS */}
                <label className="font-bold block mt-6">Associated account*</label>
                <Field
                  name="associatedAccount"
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
                          className="bg-wet-concrete rounded mt-1 w-full p-2"
                          onKeyUp={debounce(
                            (e) =>
                              handleEnsAddressInputValOnKeyUp(
                                e.target.value,
                                setClientAddressInputVal
                              ),
                            200
                          )}
                        />

                        {meta.touched && meta.error && (
                          <span className="text-torch-red text-xs">{meta.error}</span>
                        )}
                        {clientEnsAddressResult && (
                          <EnsAddressMetadataText address={clientEnsAddressResult} />
                        )}
                      </>
                    )
                  }}
                </Field>
                {/* CLIENT */}
                <label className="font-bold block mt-6">Client</label>
                <Field name="client" validate={composeValidators(isEnsOrAddress)}>
                  {({ meta, input }) => {
                    return (
                      <>
                        <input
                          {...input}
                          type="text"
                          required
                          placeholder="Enter ENS name or wallet address"
                          className="bg-wet-concrete rounded mt-1 w-full p-2"
                          onKeyUp={debounce(
                            (e) =>
                              handleEnsAddressInputValOnKeyUp(
                                e.target.value,
                                setClientAddressInputVal
                              ),
                            200
                          )}
                        />

                        {meta.touched && meta.error && (
                          <span className="text-torch-red text-xs">{meta.error}</span>
                        )}
                        {clientEnsAddressResult && (
                          <EnsAddressMetadataText address={clientEnsAddressResult} />
                        )}
                      </>
                    )
                  }}
                </Field>
                {/* CONTRIBUTOR */}
                <label className="font-bold block mt-6">Contributor</label>
                <Field name="contributor" validate={composeValidators(isEnsOrAddress)}>
                  {({ meta, input }) => {
                    return (
                      <>
                        <input
                          {...input}
                          type="text"
                          required
                          placeholder="Enter ENS name or wallet address"
                          className="bg-wet-concrete rounded mt-1 w-full p-2"
                          onKeyUp={debounce(
                            (e) =>
                              handleEnsAddressInputValOnKeyUp(
                                e.target.value,
                                setContributorAddressInputVal
                              ),
                            200
                          )}
                        />

                        {meta.touched && meta.error && (
                          <span className="text-torch-red text-xs">{meta.error}</span>
                        )}
                        {contributorEnsAddressResult && (
                          <EnsAddressMetadataText address={contributorEnsAddressResult} />
                        )}
                      </>
                    )
                  }}
                </Field>
                {/* NETWORK */}
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
                {/* PAYMENT AMOUNT */}
                <label className="font-bold block mt-6">Payment*</label>
                <span className="text-xs text-concrete block">
                  The funds will be deployed to contributors.
                </span>
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
                    <label className="font-bold block mt-6">Advance payment*</label>
                    <span className="text-xs text-concrete block">
                      How much of the payment amount should the contributors expect to receive at
                      proposal approval to kickstart their project?
                    </span>
                    <Field
                      name="advancedPaymentPercentage"
                      format={formatPercentValue}
                      validate={composeValidators(requiredField, isValidAdvancedPaymentPercentage)}
                    >
                      {({ input, meta }) => {
                        return (
                          <div className="h-10 mt-1 w-full border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
                            <input
                              {...input}
                              type="text"
                              placeholder="0"
                              className="h-full p-2 inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                            />
                            <div className="py-2 px-4 w-[2%] inline h-full">%</div>
                            {meta.error && meta.touched && (
                              <span className="text-xs text-torch-red mt-2 block">
                                {meta.error}
                              </span>
                            )}
                          </div>
                        )
                      }}
                    </Field>
                  </>
                )}
                {/* TOKEN GATING */}
                <div className="flex flex-col mt-6">
                  <label className="font-bold block">Token-gated submissions</label>
                  <span className="text-xs text-concrete block">
                    Gate submissions to this RFP by holding a minimum balance of one token.
                  </span>
                </div>
                <Field name="submissionTokenAddress">
                  {({ input, meta }) => {
                    return (
                      <>
                        <div className="custom-select-wrapper">
                          <select
                            // if network is selected make the token address field required.
                            required
                            {...input}
                            className="w-full bg-wet-concrete rounded p-2 mt-1"
                            value={selectedSubmissionToken?.address as string}
                            onChange={(e) => {
                              const token = tokenOptions.find((token) =>
                                addressesAreEqual(token.address, e.target.value)
                              )
                              setSelectedSubmissionToken(token)
                              // custom values can be compatible with react-final-form by calling
                              // the props.input.onChange callback
                              // https://final-form.org/docs/react-final-form/api/Field
                              input.onChange(token?.address)
                            }}
                          >
                            <option value="">None</option>
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
                {!!selectedSubmissionToken?.address && (
                  <>
                    {/* SUBMISSION TOKEN MINIMUM BALANCE */}
                    <label className="font-bold block mt-6">Minimum balance*</label>
                    <span className="text-xs text-concrete block">
                      How many units of this token must be held?
                    </span>
                    <Field
                      name="submissionTokenMinimumBalance"
                      format={formatTokenAmount}
                      validate={composeValidators(requiredField, isValidTokenAmount)}
                    >
                      {({ input, meta }) => {
                        return (
                          <div className="h-10 mt-1 w-full border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
                            <input
                              {...input}
                              type="text"
                              placeholder="0"
                              className="h-full p-2 inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                            />
                            {meta.error && meta.touched && (
                              <span className="text-xs text-torch-red mt-2 block">
                                {meta.error}
                              </span>
                            )}
                          </div>
                        )
                      }}
                    </Field>
                  </>
                )}
                <Button
                  className="mt-12 mb-12"
                  isSubmitType={true}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  Save
                </Button>
              </div>
            </form>
          )}
        />
      </div>
    </Layout>
  )
}

RfpNewInternal.suppressFirstRenderFlicker = true
export default RfpNewInternal
