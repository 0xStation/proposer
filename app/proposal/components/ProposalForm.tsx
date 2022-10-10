import { Routes, useRouter, useMutation, useQuery, useSession } from "blitz"
import { useEffect, useState } from "react"
import { useProvider } from "wagmi"
import { RadioGroup } from "@headlessui/react"
import { Field, Form } from "react-final-form"
import useSignature from "app/core/hooks/useSignature"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import {
  SUPPORTED_CHAINS,
  LINKS,
  PAYMENT_TERM_MAP,
  PROPOSING_AS_ROLE_MAP,
} from "app/core/utils/constants"
import debounce from "lodash.debounce"
import createProposal from "app/proposal/mutations/createProposal"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { CheckCircleIcon } from "@heroicons/react/solid"
import {
  composeValidators,
  requiredField,
  isValidTokenAmount,
  isPositiveAmount,
  isEnsOrAddress,
} from "app/utils/validators"
import { AddressType, ProposalRoleType } from "@prisma/client"
import BackArrow from "app/core/icons/BackArrow"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import ImportTokenModal from "app/core/components/ImportTokenModal"
import getTokensByAccount from "../../token/queries/getTokensByAccount"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import { formatTokenAmount } from "app/utils/formatters"
import { useEnsAddress } from "wagmi"
import { AddressLink } from "../../core/components/AddressLink"
import { PaymentTerm } from "app/proposalPayment/types"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import { genProposalDigest } from "app/signatures/proposal"
import TextLink from "app/core/components/TextLink"
import { Spinner } from "app/core/components/Spinner"
import { Proposal } from "../types"
import updateProposalMetadata from "../mutations/updateProposalMetadata"
import { getHash } from "app/signatures/utils"

enum ProposalStep {
  PROPOSE = "PROPOSE",
  REWARDS = "REWARDS",
  CONFIRM = "CONFIRM",
}

const HeaderCopy = {
  [ProposalStep.PROPOSE]: "Propose",
  [ProposalStep.REWARDS]: "Define terms",
  [ProposalStep.CONFIRM]: "Confirm",
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const EnsAddressMetadataText = ({ address }) => {
  return (
    <span className="text-xs text-concrete mt-1">
      ENS Address is{" "}
      <AddressLink className="inline" address={address}>
        {address}
      </AddressLink>
    </span>
  )
}

const GnosisWalletTypeMetadataText = ({ addressType }) => {
  return (
    <>
      <span className=" text-xs text-marble-white ml-2 mt-2 block">
        The address inserted is a{" "}
        {addressType === AddressType.WALLET ? (
          <>
            <span className="font-bold">personal wallet</span>. If it is a smart contract, please
            insert a new address or change your network.
          </>
        ) : (
          <>
            <span className="font-bold">Gnosis Safe</span>.
          </>
        )}
      </span>
    </>
  )
}

const Stepper = ({ step }) => {
  return (
    <div className="w-full h-2 bg-neon-carrot relative">
      <div className="absolute left-[20px] top-[-4px]">
        <span className="h-4 w-4 rounded-full border-2 border-neon-carrot bg-tunnel-black block relative">
          <span
            className={`h-2 bg-neon-carrot block absolute ${
              step === ProposalStep.PROPOSE
                ? "w-1 rounded-l-full top-[1.75px] left-[2px]"
                : "w-2 rounded-full top-[1.75px] left-[2px]"
            }`}
          ></span>
        </span>
        <p className={`font-bold mt-2 ${step !== ProposalStep.PROPOSE && "text-concrete"}`}>
          Propose
        </p>
      </div>
      <div className="absolute left-[220px] top-[-4px]">
        <span className="h-4 w-4 rounded-full border-2 border-neon-carrot bg-tunnel-black block relative">
          {step !== ProposalStep.PROPOSE && (
            <span
              className={`h-2 bg-neon-carrot block absolute ${
                step === ProposalStep.REWARDS
                  ? "w-1 rounded-l-full top-[1.75px] left-[2px]"
                  : "w-2 rounded-full top-[1.75px] left-[2px]"
              }`}
            ></span>
          )}
        </span>
        <p className={`font-bold mt-2 ${step !== ProposalStep.REWARDS && "text-concrete"}`}>
          Define terms
        </p>
      </div>
      <div className="absolute left-[420px] top-[-4px]">
        <span className="h-4 w-4 rounded-full border-2 border-neon-carrot bg-tunnel-black block relative">
          {step === ProposalStep.CONFIRM && (
            <span className="h-2 w-1 bg-neon-carrot block absolute rounded-l-full top-[1.75px] left-[2px]"></span>
          )}
        </span>
        <p className={`font-bold mt-2 ${step !== ProposalStep.CONFIRM && "text-concrete"}`}>
          {HeaderCopy[ProposalStep.CONFIRM]}
        </p>
      </div>
    </div>
  )
}

const ProposeForm = ({ selectedNetworkId, proposingAs, setProposingAs }) => {
  const [contributorAddressType, setContributorAddressType] = useState<AddressType>()
  const [clientAddressType, setClientAddressType] = useState<AddressType>()
  const [contributorAddressInputVal, setContributorAddressInputVal] = useState<string>()
  const [clientAddressInputVal, setClientAddressInputVal] = useState<string>()

  const { data: contributorEnsAddress } = useEnsAddress({
    name: contributorAddressInputVal,
    chainId: 1,
  })
  const { data: clientEnsAddress } = useEnsAddress({
    name: clientAddressInputVal,
    chainId: 1,
  })
  let abortController = new AbortController()

  const handleEnsAddressInputValOnKeyUp = (val, setValToCheckEns) => {
    const fieldVal = val.trim()
    // if value is already an address, we don't need to check for ens
    if (ethersIsAddress(fieldVal)) return

    // set state input val to update ens address
    setValToCheckEns(fieldVal)
  }

  const handleAddressInputValOnBlur = async (val, setAddressType, ensAddress) => {
    abortController.abort() // Cancel the previous request
    abortController = new AbortController()
    const fieldVal = val.trim()

    const address = ensAddress || fieldVal
    if (selectedNetworkId !== 0 && ethersIsAddress(address)) {
      try {
        const gnosisSafeDetails = await getGnosisSafeDetails(
          selectedNetworkId,
          address,
          abortController.signal
        )

        // if the gnosisSafeDetails doesn't exist, assume that it's a personal wallet
        const addressType = !gnosisSafeDetails ? AddressType.WALLET : AddressType.SAFE

        setAddressType(addressType)
        return
      } catch (err) {
        console.error(err)
        // setContributorAddress to undefined
      }
    }
    setAddressType(undefined)
  }

  return (
    <>
      {/* PROPOSING AS */}
      <label className="font-bold block mt-6">I&apos;m proposing as...*</label>
      <Field name="proposingAs" validate={requiredField}>
        {({ input, meta }) => {
          return (
            <>
              <div className="custom-select-wrapper">
                <select
                  {...input}
                  className="w-full bg-wet-concrete rounded p-2 mt-1"
                  onChange={(e) => {
                    setProposingAs(e.target.value)

                    // custom values can be compatible with react-final-form by calling
                    // the props.input.onChange callback
                    // https://final-form.org/docs/react-final-form/api/Field
                    input.onChange(e.target.value)
                  }}
                >
                  <option value="">Select option</option>
                  {[
                    ProposalRoleType.CONTRIBUTOR,
                    ProposalRoleType.CLIENT,
                    ProposalRoleType.AUTHOR,
                  ].map((roleType, idx) => {
                    return (
                      <option key={roleType} value={roleType}>
                        {PROPOSING_AS_ROLE_MAP[roleType]?.copy || ""}
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
      {/* only show rest of step if proposingAs is selected  */}
      {!!proposingAs && (
        <>
          {/* if proposing as contributor or author, show client field */}
          {proposingAs !== ProposalRoleType.CLIENT && (
            <>
              {/* CLIENT */}
              <label className="font-bold block mt-6">
                Who will be reviewing and approving the work?*
              </label>
              <span className="text-xs text-concrete block">
                Find the <TextLink url={LINKS.STATION_WORKSPACES}>addresses</TextLink> of featured
                communities and individuals.
              </span>
              <Field name="client" validate={composeValidators(requiredField, isEnsOrAddress)}>
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
                        onBlur={(e) => {
                          handleAddressInputValOnBlur(
                            e.target.value,
                            setClientAddressType,
                            clientEnsAddress
                          )
                          input.onBlur(e)
                        }}
                      />

                      {meta.touched && meta.error && (
                        <span className="text-torch-red text-xs">{meta.error}</span>
                      )}
                      {/* {clientEnsAddress && <EnsAddressMetadataText address={clientEnsAddress} />} */}
                      {/* user feedback on address type of input */}
                      {!meta.error && input.value && !!clientAddressType && (
                        <GnosisWalletTypeMetadataText addressType={clientAddressType} />
                      )}
                    </>
                  )
                }}
              </Field>
            </>
          )}
          {/* if proposing as client or author, show contributor field */}
          {proposingAs !== ProposalRoleType.CONTRIBUTOR && (
            <>
              {/* CONTRIBUTOR */}
              <label className="font-bold block mt-6">Who will be delivering the work?*</label>
              <span className="text-xs text-concrete block">
                Find the <TextLink url={LINKS.STATION_WORKSPACES}>addresses</TextLink> of featured
                communities and individuals.
              </span>
              <Field name="contributor" validate={composeValidators(requiredField, isEnsOrAddress)}>
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
                        onBlur={(e) => {
                          handleAddressInputValOnBlur(
                            e.target.value,
                            setContributorAddressType,
                            contributorEnsAddress
                          )
                          input.onBlur(e)
                        }}
                      />

                      {meta.touched && meta.error && (
                        <span className="text-torch-red text-xs">{meta.error}</span>
                      )}
                      {/* {contributorEnsAddress && <EnsAddressMetadataText address={contributorEnsAddress} />} */}
                      {/* user feedback on address type of input */}
                      {!meta.error && input.value && !!contributorAddressType && (
                        <GnosisWalletTypeMetadataText addressType={contributorAddressType} />
                      )}
                    </>
                  )
                }}
              </Field>
            </>
          )}
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
          {/* BODY */}
          <label className="font-bold block mt-6">Details*</label>
          <span className="text-xs text-concrete block">
            Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown syntax</TextLink>. Need
            inspirations? Check out{" "}
            <TextLink url={LINKS.PROPOSAL_TEMPLATE}>proposal templates</TextLink>.
          </span>
          <Field name="body" component="textarea" validate={requiredField}>
            {({ input, meta }) => (
              <div>
                <textarea
                  {...input}
                  placeholder="Describe your ideas, detail the value you aim to deliver, and link any relevant documents."
                  className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[236px] w-full"
                />
                {/* this error shows up when the user focuses the field (meta.touched) */}
                {meta.error && meta.touched && (
                  <span className=" text-xs text-torch-red block">{meta.error}</span>
                )}
              </div>
            )}
          </Field>
        </>
      )}
    </>
  )
}

const RewardForm = ({
  selectedNetworkId,
  setSelectedNetworkId,
  selectedToken,
  setSelectedToken,
  tokenOptions,
  refetchTokens,
  needFunding,
  setNeedFunding,
  isImportTokenModalOpen,
  setIsImportTokenModalOpen,
}) => {
  const session = useSession({ suspense: false })
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)

  return (
    <>
      <ImportTokenModal
        isOpen={isImportTokenModalOpen}
        setIsOpen={setIsImportTokenModalOpen}
        chainId={selectedNetworkId?.toString()}
        // refetches the tokens in the new proposal form token dropdown
        callback={() => refetchTokens(true)}
      />
      <RadioGroup value={needFunding} onChange={setNeedFunding}>
        <div className="mt-6">
          <RadioGroup.Label className="text-base font-medium text-gray-900 mt-6">
            Does this proposal need funding?*
          </RadioGroup.Label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <RadioGroup.Option
            value={true}
            className={({ checked, active }) =>
              classNames(
                checked ? "border-transparent" : "border-gray-300",
                active ? "border-indigo-500 ring-2 ring-indigo-500" : "",
                "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
              )
            }
          >
            {({ checked, active }) => (
              <>
                <RadioGroup.Label
                  as="span"
                  className="block text-sm font-medium text-gray-900 mx-auto"
                >
                  Yes
                </RadioGroup.Label>
                <CheckCircleIcon
                  className={classNames(!checked ? "invisible" : "", "h-5 w-5 text-indigo-600")}
                  aria-hidden="true"
                />
                <span
                  className={classNames(
                    active ? "border" : "border-2",
                    checked ? "border-indigo-500" : "border-transparent",
                    "pointer-events-none absolute -inset-px rounded-lg"
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </RadioGroup.Option>
          <RadioGroup.Option
            value={false}
            className={({ checked, active }) =>
              classNames(
                checked ? "border-transparent" : "border-gray-300",
                active ? "border-indigo-500 ring-2 ring-indigo-500" : "",
                "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
              )
            }
          >
            {({ checked, active }) => (
              <>
                <RadioGroup.Label
                  as="span"
                  className="block text-sm font-medium text-gray-900 mx-auto"
                >
                  No
                </RadioGroup.Label>
                <CheckCircleIcon
                  className={classNames(!checked ? "invisible" : "", "h-5 w-5 text-indigo-600")}
                  aria-hidden="true"
                />
                <span
                  className={classNames(
                    active ? "border" : "border-2",
                    checked ? "border-indigo-500" : "border-transparent",
                    "pointer-events-none absolute -inset-px rounded-lg"
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </RadioGroup.Option>
        </div>
      </RadioGroup>

      {/* NETWORK */}
      <label className="font-bold block mt-6">Network*</label>
      <span className="text-xs text-concrete block">
        Which network would the funds get transacted on?
      </span>
      <Field name="network" validate={requiredField}>
        {({ input, meta }) => {
          return (
            <>
              <div className="custom-select-wrapper">
                <select
                  {...input}
                  className="w-full bg-wet-concrete rounded p-2 mt-1"
                  value={selectedNetworkId as number}
                  onChange={(e) => {
                    const network = SUPPORTED_CHAINS.find(
                      (chain) => chain.id === parseInt(e.target.value)
                    )
                    setSelectedNetworkId(network?.id as number)
                    // custom values can be compatible with react-final-form by calling
                    // the props.input.onChange callback
                    // https://final-form.org/docs/react-final-form/api/Field
                    input.onChange(network?.id)
                  }}
                >
                  <option value="">Choose option</option>
                  {SUPPORTED_CHAINS?.map((chain, idx) => {
                    return (
                      <option key={chain.id} value={chain.id}>
                        {chain.name}
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

      {needFunding && (
        <>
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
                          <option key={token.address} value={token.address}>
                            {token.symbol}
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
          {/* PAYMENT TYPE */}
          <label className="font-bold block mt-6">Payment terms*</label>
          <span className="text-xs text-concrete block">
            When is the payment expected to be sent to contributors?
          </span>
          <Field name="paymentTerms" validate={requiredField}>
            {({ meta, input }) => (
              <>
                <div className="custom-select-wrapper">
                  <select {...input} required className="w-full bg-wet-concrete rounded p-2 mt-1">
                    <option value="">Choose option</option>
                    <option value={PaymentTerm.ON_AGREEMENT}>
                      {PAYMENT_TERM_MAP[PaymentTerm.ON_AGREEMENT]?.copy}
                    </option>
                    <option value={PaymentTerm.AFTER_COMPLETION}>
                      {PAYMENT_TERM_MAP[PaymentTerm.AFTER_COMPLETION]?.copy}
                    </option>
                  </select>
                </div>
              </>
            )}
          </Field>
        </>
      )}
    </>
  )
}

const ConfirmForm = () => {
  return (
    <div className="flex flex-col justify-center items-center mt-10">
      <p>
        Upon confirmation, the proposal will be sent to all parties included in the proposal. You
        also have the option to send the proposal later.
      </p>
    </div>
  )
}

const ProposalCreationLoadingScreen = ({ createdProposal, proposalShouldSendLater }) => {
  const sendNowLoadingState = createdProposal && !proposalShouldSendLater
  return (
    <div className="flex flex-col justify-center items-center mt-48">
      <p className="text-concrete tracking-wide">
        {sendNowLoadingState ? "Sign to prove your authorship." : "Creating proposal..."}
      </p>
      {sendNowLoadingState && (
        <p className="text-concrete tracking-wide">Check your wallet for your next action.</p>
      )}
      <div className="h-4 w-4 mt-6">
        <Spinner fill="white" />
      </div>
    </div>
  )
}

export const ProposalForm = ({
  prefillClients,
  prefillContributors,
}: {
  prefillClients: string[]
  prefillContributors: string[]
}) => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const walletModalOpen = useStore((state) => state.walletModalOpen)
  const session = useSession({ suspense: false })
  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(0)
  const [selectedToken, setSelectedToken] = useState<any>()
  const [needFunding, setNeedFunding] = useState<boolean>(true)
  const [tokenOptions, setTokenOptions] = useState<any[]>()
  const [proposalStep, setProposalStep] = useState<ProposalStep>(ProposalStep.PROPOSE)
  const [proposalShouldSendLater, setProposalShouldSendLater] = useState<boolean>(false)
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [createdProposal, setCreatedProposal] = useState<Proposal | null>(null)
  const [proposingAs, setProposingAs] = useState<string>(
    // set default proposingAs to prefilled values, choosing contributor if both provided for product bias
    prefillClients.length > 0
      ? ProposalRoleType.CONTRIBUTOR
      : prefillContributors.length > 0
      ? ProposalRoleType.CLIENT
      : ""
  )
  const [
    shouldHandlePostProposalCreationProcessing,
    setShouldHandlePostProposalCreationProcessing,
  ] = useState<boolean>(false)
  // default to mainnet since we're using it to check ENS
  // which pretty much only exists on mainnet as of right now
  const provider = useProvider({ chainId: 1 })

  const { signMessage } = useSignature()

  const confirmAuthorship = async ({ proposal }) => {
    // confirming authorship occurs after a proposal has been created and is triggered in a `useEffect`.
    // By confirming authorship, the user signs a generated message containing the proposal's contents.
    // The signature then acts as a verification / acknowledgement from the author that they were the one
    // to create the proposal.
    try {
      const proposalToRequestSignature = proposal
      const authorRole = proposalToRequestSignature?.roles?.find(
        (role) => role.type === ProposalRoleType.AUTHOR
      )

      // if user disconnects and logs in as another user, we need to check if they are the author
      if (authorRole?.address !== session?.siwe?.address) {
        throw Error("Current address doesn't match author's address.")
      }
      // prompt author to sign proposal to prove they are the author of the content
      const message = genProposalDigest(proposalToRequestSignature)
      const signature = await signMessage(message)

      if (!signature) {
        throw Error("Unsuccessful signature.")
      }
      const { domain, types, value } = message
      const proposalHash = getHash(domain, types, value)

      const updatedProposal = await updateProposalMetadataMutation({
        proposalId: proposalToRequestSignature?.id as string,
        authorSignature: signature as string,
        signatureMessage: message,
        proposalHash,
        contentTitle: proposalToRequestSignature?.data?.content?.title,
        contentBody: proposalToRequestSignature?.data?.content?.body,
        totalPayments: proposalToRequestSignature?.data?.totalPayments,
        paymentTerms: proposalToRequestSignature?.data?.paymentTerms,
      })

      if (updatedProposal) {
        // redirect to the proposal's view page
        router.push(
          Routes.ViewProposal({
            proposalId: proposal.id,
          })
        )
      }
    } catch (err) {
      setShouldHandlePostProposalCreationProcessing(false)
      setIsLoading(false)
      console.error(err)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: err.message,
      })
      return
    }
  }

  useEffect(() => {
    if (!walletModalOpen && isLoading) {
      setIsLoading(false)
      setProposalShouldSendLater(false)
    }
  }, [walletModalOpen])

  useEffect(() => {
    // `shouldHandlePostProposalCreationProcessing` is used to retrigger this `useEffect` hook
    // if the user declines to sign the message verifying their authorship.
    if (createdProposal && shouldHandlePostProposalCreationProcessing) {
      if (!proposalShouldSendLater) {
        confirmAuthorship({ proposal: createdProposal })
      } else {
        router.push(
          Routes.ViewProposal({
            proposalId: createdProposal.id,
          })
        )
      }
    }
  }, [createdProposal, proposalShouldSendLater, shouldHandlePostProposalCreationProcessing])

  const handleResolveEnsAddress = async (fieldValue) => {
    if (ethersIsAddress(fieldValue)) {
      return fieldValue
    } else {
      try {
        const resolvedEnsAddress = await provider.resolveName(fieldValue)
        return resolvedEnsAddress
      } catch (err) {
        console.warn(err)
        return null
      }
    }
  }

  const [savedUserTokens, { refetch: refetchTokens }] = useQuery(
    getTokensByAccount,
    {
      chainId: selectedNetworkId,
      userId: session?.userId as number,
    },
    { enabled: Boolean(selectedNetworkId && session?.userId) }
  )
  console.log("tokenOptions", tokenOptions)

  useEffect(() => {
    console.log("savedUserTokens", savedUserTokens)
    if (selectedNetworkId) {
      const networkTokens = getNetworkTokens(selectedNetworkId)
      setTokenOptions([...networkTokens, ...(savedUserTokens || [])])
    }
  }, [savedUserTokens])

  const [createProposalMutation] = useMutation(createProposal, {
    onSuccess: (data) => {
      setCreatedProposal(data)
      setShouldHandlePostProposalCreationProcessing(true)
    },
    onError: (error: Error) => {
      console.log("we are erroring")
      console.error(error)
    },
  })
  const [updateProposalMetadataMutation] = useMutation(updateProposalMetadata, {
    onSuccess: (data) => {
      setProposalStep(ProposalStep.CONFIRM)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <div>
      <div className="max-w-[580px] mx-auto mt-12">
        <Stepper step={proposalStep} />
        <Form
          initialValues={{
            proposingAs: proposingAs || "",
            client: prefillClients?.[0] || "",
            contributor: prefillContributors?.[0] || "",
            // proposingAs default set in useState initialization
          }}
          onSubmit={async (values: any, form) => {
            // an author needs to sign the proposal to upload the content to ipfs.
            // if they decline the signature, but submit again, we don't want to
            // create the same proposal, rather we want to skip to the signature step.
            if (createdProposal) {
              router.push(
                Routes.ViewProposal({
                  proposalId: createdProposal.id,
                })
              )
            } else {
              let contributorAddress
              let clientAddress
              // if proposing as contributor, take active user address
              // otherwise, resolve input ENS or address
              if (proposingAs === ProposalRoleType.CONTRIBUTOR) {
                contributorAddress = activeUser?.address
              } else {
                contributorAddress = await handleResolveEnsAddress(values.contributor?.trim())
              }
              // if proposing as client, take active user address
              // otherwise, resolve input ENS or address
              if (proposingAs === ProposalRoleType.CLIENT) {
                clientAddress = activeUser?.address
              } else {
                clientAddress = await handleResolveEnsAddress(values.client?.trim())
              }

              if (!contributorAddress) {
                setIsLoading(false)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message:
                    proposingAs === ProposalRoleType.CONTRIBUTOR
                      ? "Not signed in, please connect wallet and sign in."
                      : "Invalid ENS name or wallet address provided.",
                })
                return
              }
              if (!clientAddress) {
                setIsLoading(false)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message:
                    proposingAs === ProposalRoleType.CLIENT
                      ? "Not signed in, please connect wallet and sign in."
                      : "Invalid ENS name or wallet address provided.",
                })
                return
              }
              if (addressesAreEqual(contributorAddress, clientAddress)) {
                setIsLoading(false)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message:
                    proposingAs !== ProposalRoleType.AUTHOR
                      ? "Cannot propose to yourself, please propose to another address."
                      : "Same address cannot deliver and review work, please change either address.",
                })
                return
              }

              // tokenAddress might just be null if they are not requesting funding
              // need to check tokenAddress exists, AND it is not found before erroring
              const token = values.tokenAddress
                ? tokenOptions?.find((token) =>
                    addressesAreEqual(token.address, values.tokenAddress)
                  )
                : null

              if (values.tokenAddress && !token) {
                setIsLoading(false)
                throw Error("token not found")
              }

              let milestones: any[] = []
              let payments: any[] = []
              // if payment details are present, populate milestone and payment objects
              // supports payment and non-payment proposals
              if (needFunding) {
                if (
                  values.paymentTerms !== PaymentTerm.ON_AGREEMENT &&
                  values.paymentTerms !== PaymentTerm.AFTER_COMPLETION
                ) {
                  setIsLoading(false)
                  console.error(
                    "Missing payment terms, please select an option on the previous page."
                  )
                  setToastState({
                    isToastShowing: true,
                    type: "error",
                    message: "Missing payment terms, please select an option on the previous page.",
                  })
                  return
                }

                milestones = [
                  {
                    index: 0,
                    title: "Pay contributor",
                  },
                ]
                payments = [
                  {
                    milestoneIndex: 0,
                    senderAddress: clientAddress,
                    recipientAddress: contributorAddress,
                    amount: parseFloat(values.paymentAmount),
                    token: { ...token, chainId: selectedNetworkId },
                  },
                ]
              }

              try {
                await createProposalMutation({
                  contentTitle: values.title,
                  contentBody: values.body,
                  contributorAddresses: [contributorAddress],
                  clientAddresses: [clientAddress],
                  authorAddresses: [session?.siwe?.address as string],
                  milestones,
                  payments,
                  paymentTerms: values.paymentTerms,
                })
              } catch (err) {
                setIsLoading(false)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: err.message,
                })
                return
              }
            }
          }}
          render={({ form, handleSubmit }) => {
            const formState = form.getState()
            return (
              <form onSubmit={handleSubmit} className="mt-20">
                <div className="rounded-2xl border border-concrete p-6 h-[560px] overflow-y-scroll">
                  {!isLoading ? (
                    <>
                      <div className="mt-2 flex flex-row justify-between items-center">
                        <h2 className="text-marble-white text-xl font-bold">
                          {HeaderCopy[proposalStep]}
                        </h2>
                        {/* TODO: bring back "Last updated" with editing functionality */}
                        {/* <span className="text-xs text-concrete uppercase">
                          Last updated: {formatDate(new Date())}
                        </span> */}
                      </div>
                      <div className="flex flex-col col-span-2">
                        {proposalStep === ProposalStep.PROPOSE && (
                          <ProposeForm
                            selectedNetworkId={selectedNetworkId}
                            proposingAs={proposingAs}
                            setProposingAs={setProposingAs}
                          />
                        )}
                        {proposalStep === ProposalStep.REWARDS && (
                          <RewardForm
                            tokenOptions={tokenOptions}
                            selectedNetworkId={selectedNetworkId}
                            setSelectedNetworkId={setSelectedNetworkId}
                            selectedToken={selectedToken}
                            setSelectedToken={setSelectedToken}
                            refetchTokens={refetchTokens}
                            needFunding={needFunding}
                            setNeedFunding={setNeedFunding}
                            isImportTokenModalOpen={isImportTokenModalOpen}
                            setIsImportTokenModalOpen={setIsImportTokenModalOpen}
                          />
                        )}
                        {proposalStep === ProposalStep.CONFIRM && <ConfirmForm />}
                      </div>
                    </>
                  ) : (
                    <ProposalCreationLoadingScreen
                      createdProposal={createdProposal}
                      proposalShouldSendLater={proposalShouldSendLater}
                    />
                  )}
                </div>
                {proposalStep === ProposalStep.PROPOSE && (
                  <Button
                    isDisabled={
                      // has not selected who user is proposing as
                      !formState.values.proposingAs ||
                      // proposing as author or client but has not filled in contributor
                      (formState.values.proposingAs !== ProposalRoleType.CONTRIBUTOR &&
                        !formState.values.contributor) ||
                      // proposing as author or contributor but has not filled in client
                      (formState.values.proposingAs !== ProposalRoleType.CLIENT &&
                        !formState.values.client) ||
                      // has not filled in title or body
                      !formState.values.title ||
                      !formState.values.body
                    }
                    className="mt-6 float-right"
                    onClick={() => {
                      setProposalStep(ProposalStep.REWARDS)
                    }}
                  >
                    Next
                  </Button>
                )}
                {proposalStep === ProposalStep.REWARDS && (
                  <div className="flex justify-between mt-6">
                    <span
                      onClick={() => setProposalStep(ProposalStep.PROPOSE)}
                      className="cursor-pointer border rounded border-marble-white p-2 self-start"
                    >
                      <BackArrow className="fill-marble-white" />
                    </span>
                    <Button
                      isDisabled={
                        // CHECK CONTENT ON PROPOSE STEP
                        // has not selected who user is proposing as
                        !formState.values.proposingAs ||
                        // proposing as author or client but has not filled in contributor
                        (formState.values.proposingAs !== ProposalRoleType.CONTRIBUTOR &&
                          !formState.values.contributor) ||
                        // proposing as author or contributor but has not filled in client
                        (formState.values.proposingAs !== ProposalRoleType.CLIENT &&
                          !formState.values.client) ||
                        // has not filled in title or body
                        !formState.values.title ||
                        !formState.values.body ||
                        // CHECK CONTENT ON DETAILS STEP
                        !formState.values.network ||
                        (needFunding
                          ? !(
                              formState.values.tokenAddress &&
                              formState.values.paymentAmount &&
                              formState.values.paymentTerms
                            )
                          : false)
                      }
                      className="float-right"
                      onClick={() => {
                        setProposalStep(ProposalStep.CONFIRM)
                      }}
                    >
                      Next
                    </Button>
                  </div>
                )}
                {proposalStep === ProposalStep.CONFIRM && (
                  <div className="flex justify-between mt-6">
                    <span
                      onClick={() => setProposalStep(ProposalStep.REWARDS)}
                      className="cursor-pointer border rounded border-marble-white p-2 self-start"
                    >
                      <BackArrow className="fill-marble-white" />
                    </span>
                    <div>
                      <Button
                        type={ButtonType.Secondary}
                        className="mr-2"
                        isDisabled={isLoading}
                        isLoading={proposalShouldSendLater && isLoading}
                        onClick={async (e) => {
                          e.preventDefault()
                          setProposalShouldSendLater(true)
                          setIsLoading(true)
                          if (session.siwe?.address) {
                            await handleSubmit()
                          } else {
                            toggleWalletModal(true)
                          }
                        }}
                      >
                        Send later
                      </Button>
                      <Button
                        isDisabled={isLoading}
                        isLoading={!proposalShouldSendLater && isLoading}
                        onClick={async (e) => {
                          e.preventDefault()
                          setIsLoading(true)
                          if (session.siwe?.address) {
                            if (createdProposal) {
                              setShouldHandlePostProposalCreationProcessing(true)
                            } else {
                              await handleSubmit()
                            }
                          } else {
                            toggleWalletModal(true)
                          }
                        }}
                      >
                        Send proposal
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            )
          }}
        />
      </div>
    </div>
  )
}

ProposalForm.suppressFirstRenderFlicker = true

export default ProposalForm
