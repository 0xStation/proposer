import { Routes, useRouter, useMutation, useQuery } from "blitz"
import { useEffect, useState } from "react"
import { RadioGroup } from "@headlessui/react"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { SUPPORTED_CHAINS, ETH_METADATA } from "app/core/utils/constants"
import networks from "app/utils/networks.json"
import createProposal from "app/proposalNew/mutations/createProposalNew"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { CheckCircleIcon } from "@heroicons/react/solid"
import { requiredField } from "app/utils/validators"
import getProposalNewSignaturesById from "app/proposalNew/queries/getProposalNewSignaturesById"
import truncateString from "app/core/utils/truncateString"
import { ProposalRoleType } from "@prisma/client"
import BackArrow from "app/core/icons/BackArrow"
import ApproveProposalNewModal from "app/proposalNew/components/ApproveProposalNewModal"
import { genUrlFromRoute } from "app/utils/genUrlFromRoute"

enum ProposalStep {
  PROPOSE = "PROPOSE",
  REWARDS = "REWARDS",
  SIGN = "SIGN",
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Stepper = ({ step }) => {
  return (
    <div className="w-full h-4 bg-neon-carrot relative">
      <div className="absolute left-[20px] top-[-4px]">
        <span className="h-6 w-6 rounded-full border-2 border-neon-carrot bg-tunnel-black block relative">
          <span
            className={`h-3 bg-neon-carrot block absolute ${
              step === ProposalStep.PROPOSE
                ? "w-1.5 rounded-l-full top-[4px] left-[3.5px]"
                : "w-3 rounded-full top-[4px] left-[4px]"
            }`}
          ></span>
        </span>
        <p className={`font-bold mt-2 ${step !== ProposalStep.PROPOSE && "text-concrete"}`}>
          Propose
        </p>
      </div>
      <div className="absolute left-[220px] top-[-4px]">
        <span className="h-6 w-6 rounded-full border-2 border-neon-carrot bg-tunnel-black block relative">
          {step !== ProposalStep.PROPOSE && (
            <span
              className={`h-3 bg-neon-carrot block absolute ${
                step === ProposalStep.REWARDS
                  ? "w-1.5 rounded-l-full top-[4px] left-[3.5px]"
                  : "w-3 rounded-full top-[4px] left-[4px]"
              }`}
            ></span>
          )}
        </span>
        <p className={`font-bold mt-2 ${step !== ProposalStep.REWARDS && "text-concrete"}`}>
          Define terms
        </p>
      </div>
      <div className="absolute left-[420px] top-[-4px]">
        <span className="h-6 w-6 rounded-full border-2 border-neon-carrot bg-tunnel-black block relative">
          {step === ProposalStep.SIGN && (
            <span className="h-3 w-1.5 bg-neon-carrot block absolute rounded-l-full top-[4px] left-[3.5px]"></span>
          )}
        </span>
        <p className={`font-bold mt-2 ${step !== ProposalStep.SIGN && "text-concrete"}`}>Sign</p>
      </div>
    </div>
  )
}

const ProposeForm = () => {
  return (
    <>
      {/* TITLE */}
      <label className="font-bold block mt-6">Subject*</label>
      <Field name="title" validate={requiredField}>
        {({ meta, input }) => (
          <>
            <input
              {...input}
              type="text"
              required
              placeholder="Add a title for your idea"
              className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
            />

            {meta.touched && meta.error && (
              <span className="text-torch-red text-xs">{meta.error}</span>
            )}
          </>
        )}
      </Field>
      {/* BODY */}
      <label className="font-bold block mt-6">Details*</label>
      <Field name="body" component="textarea" validate={requiredField}>
        {({ input, meta }) => (
          <div>
            <textarea
              {...input}
              placeholder="Describe your ideas, detail the value you aim to deliver, and link any relevant documents."
              className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2 rounded min-h-[236px] w-full"
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

const RewardForm = ({ selectedNetworkId, setSelectedNetworkId, selectedToken, tokenOptions }) => {
  const [needFunding, setNeedFunding] = useState<boolean>(true)
  return (
    <>
      <RadioGroup value={needFunding} onChange={setNeedFunding}>
        <RadioGroup.Label className="text-base font-medium text-gray-900">
          Does this proposal need funding?
        </RadioGroup.Label>

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

      {/* CONTRIBUTOR */}
      <label className="font-bold block mt-6">Contributor</label>
      <span className="text-xs text-concrete block">
        Who will be responsible for delivering the work outlined in this proposal? Paste your
        address if this is you.
      </span>
      <Field name="contributor">
        {({ meta, input }) => (
          <>
            <input
              {...input}
              type="text"
              required
              placeholder="Enter wallet or ENS address"
              className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
            />

            {meta.touched && meta.error && (
              <span className="text-torch-red text-xs">{meta.error}</span>
            )}
          </>
        )}
      </Field>
      {/* CLIENT */}
      <label className="font-bold block mt-6">Reviewer*</label>
      <span className="text-xs text-concrete block">
        Who will be responsible for reviewing and deploying the funds outlined in this proposal? See
        the list of community addresses here.
      </span>
      <Field name="client">
        {({ meta, input }) => (
          <>
            <input
              {...input}
              type="text"
              required
              placeholder="Enter wallet or ENS address"
              className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
            />

            {meta.touched && meta.error && (
              <span className="text-torch-red text-xs">{meta.error}</span>
            )}
          </>
        )}
      </Field>

      {needFunding && (
        <>
          {/* NETWORK */}
          <label className="font-bold block mt-6">Network</label>
          <span className="text-xs text-concrete block">Which network to transact on</span>
          <Field name="network">
            {({ input, meta }) => {
              return (
                <div className="custom-select-wrapper">
                  <select
                    {...input}
                    className="w-full bg-wet-concrete border border-concrete rounded p-1 mt-1"
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
          {/* TOKEN */}
          <div className="flex flex-col mt-6">
            <label className="font-bold block">Reward token</label>
            <span className="text-xs text-concrete block">Which token to be paid with</span>
            <Field name="tokenAddress">
              {({ input, meta }) => {
                return (
                  <div className="custom-select-wrapper">
                    <select
                      {...input}
                      className="w-full bg-wet-concrete border border-concrete rounded p-1 mt-1"
                      value={selectedToken?.address as string}
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
          </div>
          {/* PAYMENT AMOUNT */}
          <label className="font-bold block mt-6">Payment Amount</label>
          <span className="text-xs text-concrete block">
            The funds will be deployed to the one responsible for delivering the work.
          </span>
          <Field name="paymentAmount">
            {({ meta, input }) => (
              <>
                <input
                  {...input}
                  type="text"
                  required
                  placeholder="0.00"
                  className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                />

                {meta.touched && meta.error && (
                  <span className="text-torch-red text-xs">{meta.error}</span>
                )}
              </>
            )}
          </Field>
        </>
      )}
    </>
  )
}

const SignForm = ({ activeUser, proposal, signatures }) => {
  const [isApproveProposalModalOpen, setIsApproveProposalModalOpen] = useState<boolean>(false)
  const [isActionPending, setIsActionPending] = useState<boolean>(false)

  const RoleSignature = ({ role }) => {
    const userHasRole = addressesAreEqual(activeUser?.address || "", role.address)

    const userHasSigned = signatures?.some((commitment) =>
      addressesAreEqual(activeUser?.address || "", commitment.address)
    )

    const showSignButton = userHasRole && !userHasSigned

    const addressHasSigned = (address: string) => {
      return signatures?.some((signature) => addressesAreEqual(address, signature.address)) || false
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
              {role.role}
            </span>
          </div>
          <p className="mt-1 text-xs text-light-concrete">{responsiblityCopy[role.role]}</p>
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
      <ApproveProposalNewModal
        isOpen={isApproveProposalModalOpen}
        setIsOpen={setIsApproveProposalModalOpen}
        proposal={proposal}
        isSigning={isActionPending}
        setIsSigning={setIsActionPending}
      />
      <p>All signatures are required to activate the agreement.</p>
      <div className="space-y-4 mt-6">
        <RoleSignature
          role={proposal?.roles?.find((role) => role.role === ProposalRoleType.CONTRIBUTOR)}
        />
        <RoleSignature
          role={proposal?.roles?.find((role) => role.role === ProposalRoleType.CLIENT)}
        />
        <RoleSignature
          role={proposal?.roles?.find((role) => role.role === ProposalRoleType.AUTHOR)}
        />
      </div>
    </div>
  )
}

export const ProposalNewForm = () => {
  const router = useRouter()
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const walletModalOpen = useStore((state) => state.walletModalOpen)
  const activeUser = useStore((state) => state.activeUser)
  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(0)
  const [selectedToken, setSelectedToken] = useState<any>()
  const [tokenOptions, setTokenOptions] = useState<any[]>()
  const [proposalStep, setProposalStep] = useState<ProposalStep>(ProposalStep.PROPOSE)
  const [proposal, setProposal] = useState<any>()
  const [isClipboardAddressCopied, setIsClipboardAddressCopied] = useState<boolean>(false)

  const [signatures] = useQuery(
    getProposalNewSignaturesById,
    { proposalId: proposal && proposal.id },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )

  const userHasSigned = signatures?.some((commitment) =>
    addressesAreEqual(activeUser?.address || "", commitment.address)
  )

  const HeaderCopy = {
    [ProposalStep.PROPOSE]: "Propose",
    [ProposalStep.REWARDS]: "Define terms",
    [ProposalStep.SIGN]: "Sign",
  }

  useEffect(() => {
    if (selectedNetworkId) {
      const stablecoins = networks[selectedNetworkId]?.stablecoins || []
      setTokenOptions([ETH_METADATA, ...stablecoins])
      setSelectedToken("")
    }
  }, [selectedNetworkId])

  const [createProposalMutation] = useMutation(createProposal, {
    onSuccess: (data) => {
      console.log("proposal created", data)
      setProposal(data)
      setProposalStep(ProposalStep.SIGN)
    },
    onError: (error: Error) => {
      console.log("we are erroring")
      console.error(error)
    },
  })

  return (
    <div>
      <div className="max-w-[580px] mx-auto mt-12">
        <Stepper step={proposalStep} />
        <Form
          onSubmit={async (values: any, form) => {
            // tokenAddress might just be null if they are not requesting funding
            // need to check tokenAddress exists, AND it is not found before erroring
            const token = values.tokenAddress
              ? tokenOptions?.find((token) => addressesAreEqual(token.address, values.tokenAddress))
              : null

            if (values.tokenAddress && !token) {
              throw Error("token not found")
            }

            createProposalMutation({
              contentTitle: values.title,
              contentBody: values.body,
              contributorAddress: values.contributor,
              clientAddress: values.client,
              authorAddresses: [activeUser!.address!],
              token: { ...token, chainId: selectedNetworkId },
              paymentAmount: values.paymentAmount,
            })
          }}
          render={({ form, handleSubmit }) => {
            const formState = form.getState()
            return (
              <form onSubmit={handleSubmit} className="mt-20">
                <div className="rounded-lg border border-concrete p-6 h-[600px] overflow-y-scroll">
                  <div className="flex flex-row justify-between items-center">
                    <h2 className="text-marble-white text-2xl font-bold">
                      {HeaderCopy[proposalStep]}
                    </h2>
                    <span className="text-xs text-light-concrete">Last updated: insert date</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    {proposalStep === ProposalStep.PROPOSE && <ProposeForm />}
                    {proposalStep === ProposalStep.REWARDS && (
                      <RewardForm
                        tokenOptions={tokenOptions}
                        selectedNetworkId={selectedNetworkId}
                        setSelectedNetworkId={setSelectedNetworkId}
                        selectedToken={selectedToken}
                      />
                    )}
                    {proposalStep === ProposalStep.SIGN && (
                      <SignForm
                        proposal={proposal}
                        activeUser={activeUser}
                        signatures={signatures}
                      />
                    )}
                  </div>
                </div>
                {proposalStep === ProposalStep.PROPOSE && (
                  <Button
                    isDisabled={!formState.values.title || !formState.values.body}
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
                    {activeUser ? (
                      <Button isSubmitType={true}>Save</Button>
                    ) : (
                      <Button onClick={() => toggleWalletModal(true)}>Connect</Button>
                    )}
                  </div>
                )}
                {proposalStep === ProposalStep.SIGN && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      className="mr-2"
                      type={ButtonType.Secondary}
                      onClick={() => {
                        const path = genUrlFromRoute(
                          Routes.ViewProposalNew({
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
                          Routes.ViewProposalNew({
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

ProposalNewForm.suppressFirstRenderFlicker = true

export default ProposalNewForm
