import { Routes, useRouter, useMutation, useQuery, invoke, useSession } from "blitz"
import { useEffect, useState } from "react"
import { useProvider } from "wagmi"
import { RadioGroup } from "@headlessui/react"
import { Field, Form } from "react-final-form"
import useSignature from "app/core/hooks/useSignature"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { SUPPORTED_CHAINS, LINKS, PAYMENT_TERM_MAP } from "app/core/utils/constants"
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
import getProposalSignaturesById from "app/proposal/queries/getProposalSignaturesById"
import truncateString from "app/core/utils/truncateString"
import { AddressType, ProposalRoleType } from "@prisma/client"
import BackArrow from "app/core/icons/BackArrow"
import ApproveProposalModal from "app/proposal/components/ApproveProposalModal"
import { genUrlFromRoute } from "app/utils/genUrlFromRoute"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import { DateTime } from "luxon"
import getFormattedDateForMinDateInput from "app/utils/getFormattedDateForMinDateInput"
import ImportTokenModal from "app/core/components/ImportTokenModal"
import getTokensByAccount from "../../token/queries/getTokensByAccount"
import ConnectWalletModal from "app/core/components/ConnectWalletModal"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import { formatTokenAmount } from "app/utils/formatters"
import { formatDate } from "app/core/utils/formatDate"
import { useEnsAddress } from "wagmi"
import { AddressLink } from "../../core/components/AddressLink"
import { PaymentTerm } from "app/proposalPayment/types"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import { activeUserMeetsCriteria } from "app/core/utils/activeUserMeetsCriteria"
import { genProposalDigest } from "app/signatures/proposal"
import TextLink from "app/core/components/TextLink"
import { Spinner } from "app/core/components/Spinner"
import { Proposal } from "../types"
import updateProposalMetadata from "../mutations/updateProposalMetadata"
import { getHash } from "app/signatures/utils"

enum ProposalStep {
  PROPOSE = "PROPOSE",
  REWARDS = "REWARDS",
  SIGN = "SIGN",
  APPROVE = "APPROVE",
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
          {step === ProposalStep.APPROVE && (
            <span className="h-2 w-1 bg-neon-carrot block absolute rounded-l-full top-[1.75px] left-[2px]"></span>
          )}
        </span>
        <p className={`font-bold mt-2 ${step !== ProposalStep.APPROVE && "text-concrete"}`}>
          Approve
        </p>
      </div>
    </div>
  )
}

const ProposeForm = ({ selectedNetworkId }) => {
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
      {/* CLIENT */}
      <label className="font-bold block mt-6">Client*</label>
      <span className="text-xs text-concrete block">
        Who will be responsible for reviewing and deploying the funds outlined in this proposal? See
        the list of community addresses <TextLink url={LINKS.STATION_WORKSPACES}>here</TextLink>.
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
                  (e) => handleEnsAddressInputValOnKeyUp(e.target.value, setClientAddressInputVal),
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
      {/* CONTRIBUTOR */}
      <label className="font-bold block mt-6">Contributor*</label>
      <span className="text-xs text-concrete block">
        Who will be responsible for delivering the work outlined in this proposal?
        <p>Paste your address if this is you.</p>
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
                    handleEnsAddressInputValOnKeyUp(e.target.value, setContributorAddressInputVal),
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
        Supports markdown syntax. <TextLink url={LINKS.MARKDOWN_GUIDE}>Learn more</TextLink>
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
  )
}

const RewardForm = ({
  selectedNetworkId,
  setSelectedNetworkId,
  selectedToken,
  setSelectedToken,
  tokenOptions,
  setShouldRefetchTokens,
  needFunding,
  setNeedFunding,
  setIsConnectWalletModalOpen,
  isImportTokenModalOpen,
  setIsImportTokenModalOpen,
}) => {
  const session = useSession({ suspense: false })

  return (
    <>
      <ImportTokenModal
        isOpen={isImportTokenModalOpen}
        setIsOpen={setIsImportTokenModalOpen}
        chainId={selectedNetworkId?.toString()}
        // `shouldRefetchTokens` triggers the use effect that
        // displays the tokens in the new proposal form token dropdown
        callback={() => setShouldRefetchTokens(true)}
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
      <span className="text-xs text-concrete block">Which network to transact on</span>
      <Field name="network" validate={requiredField}>
        {({ input, meta }) => {
          return (
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
              {meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )}
            </div>
          )
        }}
      </Field>

      {needFunding && (
        <>
          {/* TOKEN */}
          <div className="flex flex-col mt-6">
            <label className="font-bold block">Reward token*</label>
            <span className="text-xs text-concrete block">
              Which token to be paid with (pick a network first)
            </span>
          </div>
          <Field name="tokenAddress" validate={requiredField}>
            {({ input, meta }) => {
              return (
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
                  {meta.touched && meta.error && (
                    <span className="text-torch-red text-xs">{meta.error}</span>
                  )}
                </div>
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
                  ? setIsConnectWalletModalOpen(true)
                  : setIsImportTokenModalOpen(true)
              }}
            >
              + Import
            </button>
          </div>
          {/* PAYMENT AMOUNT */}
          <label className="font-bold block mt-6">Payment*</label>
          <span className="text-xs text-concrete block">
            The funds will be deployed to the one responsible for delivering the work.
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
          <span className="text-xs text-concrete block">When will payment be sent?</span>
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
                  {meta.touched && meta.error && (
                    <span className="text-torch-red text-xs">{meta.error}</span>
                  )}
                </div>
              </>
            )}
          </Field>
        </>
      )}

      {/* START DATE */}
      <label className="font-bold block mt-6">Start</label>
      <Field name="startDate">
        {({ input, meta }) => {
          return (
            <div>
              <input
                {...input}
                type="datetime-local"
                min={getFormattedDateForMinDateInput({ dateTime: DateTime.local() })}
                className="bg-wet-concrete rounded p-2 mt-1 w-full"
              />
              {meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )}
            </div>
          )
        }}
      </Field>
      {/* END DATE */}
      <label className="font-bold block mt-6">End</label>
      <Field name="endDate">
        {({ input, meta }) => {
          return (
            <div>
              <input
                {...input}
                type="datetime-local"
                min={getFormattedDateForMinDateInput({ dateTime: DateTime.local() })}
                className="bg-wet-concrete rounded p-2 mt-1 w-full"
              />
              {meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )}
            </div>
          )
        }}
      </Field>
    </>
  )
}

const SignForm = ({ activeUser, proposal, signatures }) => {
  const [isApproveProposalModalOpen, setIsApproveProposalModalOpen] = useState<boolean>(false)

  const RoleSignature = ({ role }) => {
    const userHasRole = addressesAreEqual(activeUser?.address || "", role?.address)

    const userHasSigned = activeUserMeetsCriteria(activeUser, signatures)

    const showSignButton = userHasRole && !userHasSigned

    const addressHasSigned = (address: string) => {
      return (
        signatures?.some((signature) => addressesAreEqual(address, signature?.address)) || false
      )
    }

    const responsiblityCopy = {
      [ProposalRoleType.CONTRIBUTOR]:
        "Responsible for delivering the work outlined in this proposal.",
      [ProposalRoleType.CLIENT]: "Responsible for deploying the funds outlined in this proposal.",
      [ProposalRoleType.AUTHOR]: "Facilitated the creation of this proposal.",
    }

    return (
      <div className="flex flex-row w-full justify-between">
        <div className="flex flex-col">
          <div className="flex flex-row space-x-2">
            <p className="mr-4">{truncateString(role?.address)}</p>
            <span className="uppercase text-xs px-2 py-1 bg-wet-concrete rounded-full">
              {role?.type}
            </span>
          </div>
          <p className="mt-1 text-xs text-light-concrete">{responsiblityCopy[role?.type]}</p>
        </div>
        {showSignButton ? (
          <span
            className="text-electric-violet cursor-pointer"
            onClick={() => setIsApproveProposalModalOpen(true)}
          >
            Sign
          </span>
        ) : (
          <div className="flex flex-row items-center space-x-1 ml-4">
            <span
              className={`h-2 w-2 rounded-full bg-${
                addressHasSigned(role?.address) ? "magic-mint" : "neon-carrot"
              }`}
            />

            <div className="font-bold text-xs uppercase tracking-wider">
              {addressHasSigned(role?.address) ? "signed" : "pending"}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-6">
      <ApproveProposalModal
        isOpen={isApproveProposalModalOpen}
        setIsOpen={setIsApproveProposalModalOpen}
        proposal={proposal}
      />
      <p>All signatures are required to activate the agreement.</p>
      <div className="space-y-4 mt-6">
        <RoleSignature
          role={proposal?.roles?.find((role) => role.type === ProposalRoleType.CONTRIBUTOR)}
        />
        <RoleSignature
          role={proposal?.roles?.find((role) => role.type === ProposalRoleType.CLIENT)}
        />
        <RoleSignature
          role={proposal?.roles?.find((role) => role.type === ProposalRoleType.AUTHOR)}
        />
      </div>
    </div>
  )
}

const ProposalCreationLoadingScreen = ({ createdProposal }) => (
  <div className="flex flex-col justify-center items-center mt-48">
    <p className="text-concrete tracking-wide">
      {createdProposal ? "Sign to prove your authorship." : "Creating proposal..."}
    </p>
    {createdProposal && (
      <p className="text-concrete tracking-wide">Check your wallet for your next action.</p>
    )}
    <div className="h-4 w-4 mt-6">
      <Spinner fill="white" />
    </div>
  </div>
)

export const ProposalForm = () => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const session = useSession({ suspense: false })
  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(0)
  const [shouldRefetchTokens, setShouldRefetchTokens] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<any>()
  const [needFunding, setNeedFunding] = useState<boolean>(true)
  const [tokenOptions, setTokenOptions] = useState<any[]>()
  const [proposalStep, setProposalStep] = useState<ProposalStep>(ProposalStep.PROPOSE)
  const [proposal, setProposal] = useState<any>()
  const [isClipboardAddressCopied, setIsClipboardAddressCopied] = useState<boolean>(false)
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState<boolean>(false)
  const [isConnectWalletModalOpen, setIsConnectWalletModalOpen] = useState<boolean>(false)
  const [shouldHandleSubmit, setShouldHandleSubmit] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [createdProposal, setCreatedProposal] = useState<Proposal | null>(null)
  // default to mainnet since we're using it to check ENS
  // which pretty much only exists on mainnet as of right now
  const provider = useProvider({ chainId: 1 })

  const { signMessage } = useSignature()

  const [signatures] = useQuery(
    getProposalSignaturesById,
    { proposalId: proposal && proposal?.id },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: Boolean(proposal?.id),
    }
  )

  const userHasSigned = signatures?.some((commitment) =>
    addressesAreEqual(activeUser?.address || "", commitment.address)
  )

  const HeaderCopy = {
    [ProposalStep.PROPOSE]: "Propose",
    [ProposalStep.REWARDS]: "Define terms",
    [ProposalStep.APPROVE]: "Approve",
  }

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

  useEffect(() => {
    // Changing the network changes the token options available to us
    if (selectedNetworkId || shouldRefetchTokens) {
      // array including native chain's gas coin and stablecoins
      const networkTokens = getNetworkTokens(selectedNetworkId)
      if (session?.userId) {
        // if user is logged-in, we can fetch the
        // imported tokens they have saved to their account
        const fetchAccountTokenOptions = async () => {
          const tokens = await invoke(getTokensByAccount, {
            chainId: selectedNetworkId,
            userId: session?.userId,
          })
          setTokenOptions([...tokens, ...networkTokens])

          setShouldRefetchTokens(false)
        }
        fetchAccountTokenOptions()
      } else {
        setTokenOptions(networkTokens)
      }
      // Setting the selectedToken to an empty obj to reset the
      // selected token on network change.
      setSelectedToken({})
    }
  }, [selectedNetworkId, shouldRefetchTokens, session?.userId])

  const [createProposalMutation] = useMutation(createProposal, {
    onSuccess: (data) => {
      setProposal(data)
    },
    onError: (error: Error) => {
      console.log("we are erroring")
      console.error(error)
    },
  })
  const [updateProposalMetadataMutation] = useMutation(updateProposalMetadata, {
    onSuccess: (data) => {
      setProposal(data)
      setProposalStep(ProposalStep.APPROVE)
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
          onSubmit={async (values: any, form) => {
            // an author needs to sign the proposal to upload the content to ipfs.
            // if they decline the signature, but submit again, we don't want to
            // create the same proposal, rather we want to skip to the signature step.
            let proposal
            if (!createdProposal) {
              const resolvedContributorAddress = await handleResolveEnsAddress(
                values.contributor?.trim()
              )

              if (!resolvedContributorAddress) {
                setIsLoading(false)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: "Invalid address or ENS name for Contributor",
                })
                return
              }
              const resolvedClientAddress = await handleResolveEnsAddress(values.client?.trim())

              if (!resolvedClientAddress) {
                setIsLoading(false)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: "Invalid address or ENS name for Client",
                })
                return
              }

              if (addressesAreEqual(resolvedContributorAddress, resolvedClientAddress)) {
                setIsLoading(false)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: "Cannot use same address for Client and Contributor.",
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
                  console.error("Missing complete payment information")
                  setToastState({
                    isToastShowing: true,
                    type: "error",
                    message: "Missing complete payment information",
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
                    senderAddress: resolvedClientAddress,
                    recipientAddress: resolvedContributorAddress,
                    amount: parseFloat(values.paymentAmount),
                    token: { ...token, chainId: selectedNetworkId },
                  },
                ]
              }

              try {
                proposal = await createProposalMutation({
                  contentTitle: values.title,
                  contentBody: values.body,
                  contributorAddresses: [resolvedContributorAddress],
                  clientAddresses: [resolvedClientAddress],
                  authorAddresses: [activeUser?.address as string],
                  milestones,
                  payments,
                  paymentTerms: values.paymentTerms,
                  // convert luxon's `DateTime` obj to UTC to store in db
                  startDate: values.startDate
                    ? DateTime.fromISO(values.startDate).toUTC().toJSDate()
                    : undefined,
                  endDate: values.endDate
                    ? DateTime.fromISO(values.endDate).toUTC().toJSDate()
                    : undefined,
                })

                if (proposal) {
                  setCreatedProposal(proposal)
                }
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

            // see comment at the top of the submit function
            // this condition is here if the user needs to re-click the submit to generate a signature
            // for the proposal and pin to ipfs, but they've already created a proposal.
            try {
              const prpsal = (createdProposal as Proposal) || proposal
              const authorRole = prpsal?.roles?.find(
                (role) => role.type === ProposalRoleType.AUTHOR
              )

              // if user disconnects and logs in as another user, we need to check if they are the author
              if (authorRole?.address !== session?.siwe?.address) {
                throw Error("Current address doesn't match author's address.")
              }
              // prompt author to sign proposal to prove they are the author of the content
              const message = genProposalDigest(prpsal)
              const signature = await signMessage(message)

              if (!signature) {
                throw Error("Unsuccessful signature.")
              }
              const { domain, types, value } = message
              const proposalHash = getHash(domain, types, value)

              const updatedProposal = await updateProposalMetadataMutation({
                proposalId: prpsal?.id as string,
                authorSignature: signature as string,
                signatureMessage: message,
                proposalHash,
                contentTitle: prpsal?.data?.content?.title,
                contentBody: prpsal?.data?.content?.body,
                totalPayments: prpsal?.data?.totalPayments,
                paymentTerms: prpsal?.data?.paymentTerms,
              })

              if (updatedProposal) {
                setIsLoading(false)
                setProposalStep(ProposalStep.APPROVE)
              }
            } catch (err) {
              setIsLoading(false)
              console.error(err)
              setToastState({
                isToastShowing: true,
                type: "error",
                message: err.message,
              })
              return
            }
          }}
          render={({ form, handleSubmit }) => {
            const formState = form.getState()
            return (
              <form onSubmit={handleSubmit} className="mt-20">
                <ConnectWalletModal
                  isWalletOpen={isConnectWalletModalOpen}
                  setIsWalletOpen={setIsConnectWalletModalOpen}
                  callback={() => {
                    if (shouldHandleSubmit) {
                      // add set timeout to allow activeUser to be set
                      setTimeout(() => {
                        handleSubmit()
                      }, 500)
                    } else {
                      setIsImportTokenModalOpen(true)
                    }
                  }}
                />
                <div className="rounded-2xl border border-concrete p-6 h-[560px] overflow-y-scroll">
                  {!isLoading ? (
                    <>
                      <div className="mt-2 flex flex-row justify-between items-center">
                        <h2 className="text-marble-white text-xl font-bold">
                          {HeaderCopy[proposalStep]}
                        </h2>
                        <span className="text-xs text-concrete uppercase">
                          Last updated: {formatDate(new Date())}
                        </span>
                      </div>
                      <div className="flex flex-col col-span-2">
                        {proposalStep === ProposalStep.PROPOSE && (
                          <ProposeForm selectedNetworkId={selectedNetworkId} />
                        )}
                        {proposalStep === ProposalStep.REWARDS && (
                          <RewardForm
                            tokenOptions={tokenOptions}
                            selectedNetworkId={selectedNetworkId}
                            setSelectedNetworkId={setSelectedNetworkId}
                            selectedToken={selectedToken}
                            setSelectedToken={setSelectedToken}
                            setShouldRefetchTokens={setShouldRefetchTokens}
                            needFunding={needFunding}
                            setNeedFunding={setNeedFunding}
                            setIsConnectWalletModalOpen={setIsConnectWalletModalOpen}
                            isImportTokenModalOpen={isImportTokenModalOpen}
                            setIsImportTokenModalOpen={setIsImportTokenModalOpen}
                          />
                        )}
                        {proposalStep === ProposalStep.APPROVE && (
                          <SignForm
                            proposal={proposal}
                            activeUser={activeUser}
                            signatures={signatures}
                          />
                        )}
                      </div>{" "}
                    </>
                  ) : (
                    <ProposalCreationLoadingScreen createdProposal={createdProposal} />
                  )}
                </div>
                {proposalStep === ProposalStep.PROPOSE && (
                  <Button
                    isDisabled={
                      !formState.values.client ||
                      !formState.values.contributor ||
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
                      isDisabled={isLoading}
                      isLoading={isLoading}
                      onClick={(e) => {
                        setIsLoading(true)
                        e.preventDefault()
                        if (session.siwe?.address) {
                          handleSubmit()
                        } else {
                          setShouldHandleSubmit(true)
                          setIsConnectWalletModalOpen(true)
                        }
                      }}
                    >
                      {createdProposal ? "Publish & continue" : "Create & continue"}
                    </Button>
                  </div>
                )}
                {proposalStep === ProposalStep.APPROVE && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      className="mr-2"
                      type={ButtonType.Secondary}
                      onClick={() => {
                        const path = genUrlFromRoute(
                          Routes.ViewProposal({
                            proposalId: proposal.id,
                          })
                        )

                        navigator.clipboard
                          .writeText(`${window.location.protocol}//${window.location.host}${path}`)
                          .then(() => {
                            setIsClipboardAddressCopied(true)
                            setTimeout(() => setIsClipboardAddressCopied(false), 3000)
                          })
                      }}
                    >
                      {isClipboardAddressCopied ? "Copied!" : "Copy Link"}
                    </Button>
                    <Button
                      isDisabled={!userHasSigned}
                      onClick={() => {
                        router.push(
                          Routes.ViewProposal({
                            proposalId: proposal.id,
                          })
                        )
                      }}
                    >
                      Done
                    </Button>
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
