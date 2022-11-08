import React, { useEffect, useState } from "react"
import { useSession } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ProposalRoleType } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import FormHeaderStepper from "app/core/components/FormHeaderStepper"
import getTokensByAccount from "app/token/queries/getTokensByAccount"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import FundingFormStepPropose from "./stepPropose"
import FundingFormStepReward from "./stepReward"
import { ProposalCreationLoadingScreen } from "../ProposalCreationLoadingScreen"
import { Proposal } from "app/proposal/types"
import BackArrow from "app/core/icons/BackArrow"
import useStore from "app/core/hooks/useStore"
import createProposal from "app/proposal/mutations/createProposal"
import { useConfirmAuthorship } from "app/proposalForm/hooks/useConfirmAuthorship"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"
import { useRouter } from "next/router"
import { useNetwork } from "wagmi"
import { Form } from "react-final-form"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { PaymentTerm } from "app/proposalPayment/types"
import { ProposalFormStep, PROPOSAL_FORM_HEADER_COPY } from "app/core/utils/constants"
import { isValidAdvancedPaymentPercentage } from "app/utils/validators"
import { ConfirmForm } from "../ConfirmForm"

export const ProposalFormFunding = ({
  prefillClients,
  prefillContributors,
}: {
  prefillClients: string[]
  prefillContributors: string[]
}) => {
  const setToastState = useStore((state) => state.setToastState)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const walletModalOpen = useStore((state) => state.walletModalOpen)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [proposalStep, setProposalStep] = useState<ProposalFormStep>(ProposalFormStep.PROPOSE)
  const [proposingAs, setProposingAs] = useState<string>(
    // set default proposingAs to prefilled values, choosing contributor if both provided for product bias
    prefillClients.length > 0
      ? ProposalRoleType.CONTRIBUTOR
      : prefillContributors.length > 0
      ? ProposalRoleType.CLIENT
      : ""
  )
  const [tokenOptions, setTokenOptions] = useState<any[]>()
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<any>()
  // payment terms in parent form state because it gets reset when flipping through steps if put in the rewards form
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string>("")
  const [createdProposal, setCreatedProposal] = useState<Proposal | null>(null)
  const [proposalShouldSendLater, setProposalShouldSendLater] = useState<boolean>(false)
  const [
    shouldHandlePostProposalCreationProcessing,
    setShouldHandlePostProposalCreationProcessing,
  ] = useState<boolean>(false)
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const router = useRouter()
  const { resolveEnsAddress } = useResolveEnsAddress()

  const { chain } = useNetwork()

  useEffect(() => {
    if (!walletModalOpen && isLoading) {
      setIsLoading(false)
      setProposalShouldSendLater(false)
    }
  }, [walletModalOpen])

  const { confirmAuthorship } = useConfirmAuthorship({
    onSuccess: (updatedProposal) => {
      router.push(
        Routes.ViewProposal({
          proposalId: updatedProposal?.id,
        })
      )
    },
    onError: (error) => {
      setShouldHandlePostProposalCreationProcessing(false)
      setIsLoading(false)
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: error.message,
      })
    },
  })

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

  const [savedUserTokens, { refetch: refetchTokens }] = useQuery(
    getTokensByAccount,
    {
      chainId: chain?.id || 1,
      userId: session?.userId as number,
    },
    { suspense: false, enabled: Boolean(chain && session?.userId) }
  )

  useEffect(() => {
    // `shouldHandlePostProposalCreationProcessing` is used to retrigger this `useEffect` hook
    // if the user declines to sign the message verifying their authorship.
    if (createdProposal && shouldHandlePostProposalCreationProcessing) {
      if (!proposalShouldSendLater) {
        confirmAuthorship({ proposal: createdProposal, representingRoles: [] })
      } else {
        router.push(
          Routes.ViewProposal({
            proposalId: createdProposal.id,
          })
        )
      }
    }
  }, [createdProposal, proposalShouldSendLater, shouldHandlePostProposalCreationProcessing])

  useEffect(() => {
    if (chain?.id) {
      const networkTokens = getNetworkTokens(chain?.id || 1)
      // sets options for reward token dropdown. includes default tokens and
      // tokens that the user has imported to their account
      setTokenOptions([...networkTokens, ...(savedUserTokens || [])])
    }
  }, [chain?.id])

  return (
    <div className="max-w-[580px] h-full mx-auto">
      <FormHeaderStepper
        activeStep={PROPOSAL_FORM_HEADER_COPY[proposalStep]}
        steps={["Propose", "Define terms", "Confirm"]}
        className="mt-10"
      />
      <Form
        initialValues={{
          proposingAs: proposingAs || "",
          client: prefillClients?.[0] || "",
          contributor: prefillContributors?.[0] || "",
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
              contributorAddress = session?.siwe?.address
            } else {
              contributorAddress = await resolveEnsAddress(values.contributor?.trim())
            }
            // if proposing as client, take active user address
            // otherwise, resolve input ENS or address
            if (proposingAs === ProposalRoleType.CLIENT) {
              clientAddress = session?.siwe?.address
            } else {
              clientAddress = await resolveEnsAddress(values.client?.trim())
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

            // tokenAddress might just be null if they are not requesting funding
            // need to check tokenAddress exists, AND it is not found before erroring
            const token = values.tokenAddress
              ? tokenOptions?.find((token) => addressesAreEqual(token.address, values.tokenAddress))
              : null

            if (values.tokenAddress && !token) {
              setIsLoading(false)
              throw Error("token not found")
            }

            let milestones: any[] = []
            let payments: any[] = []
            // if payment details are present, populate milestone and payment objects
            // supports payment and non-payment proposals
            if (
              ![
                PaymentTerm.ON_AGREEMENT,
                PaymentTerm.AFTER_COMPLETION,
                PaymentTerm.ADVANCE_PAYMENT,
              ].some((term) => term === values.paymentTerms)
            ) {
              setIsLoading(false)
              console.error("Missing payment terms, please select an option on the previous page.")
              setToastState({
                isToastShowing: true,
                type: "error",
                message: "Missing payment terms, please select an option on the previous page.",
              })
              return
            }

            const tokenTransferBase = {
              senderAddress: clientAddress,
              recipientAddress: contributorAddress,
              token: { ...token, chainId: chain?.id || 1 },
            }

            // set up milestones and payments conditional on payment terms inputs
            const MILESTONE_COPY = {
              UPFRONT_PAYMENT: "Upfront payment",
              ADVANCE_PAYMENT: "Advance payment",
              COMPLETION_PAYMENT: "Completion payment",
            }

            if (values.paymentTerms === PaymentTerm.ADVANCE_PAYMENT) {
              // if pay on proposal completion and non-zero advance payment, set up two milestones and two payments
              milestones = [
                {
                  index: 0,
                  title: MILESTONE_COPY.ADVANCE_PAYMENT,
                },
                {
                  index: 1,
                  title: MILESTONE_COPY.COMPLETION_PAYMENT,
                },
              ]

              const advancedPayment =
                (parseFloat(values.paymentAmount) * parseFloat(values.advancedPaymentPercentage)) /
                100
              const completionPayment = parseFloat(values.paymentAmount) - advancedPayment

              payments = [
                {
                  ...tokenTransferBase,
                  milestoneIndex: 0,
                  amount: advancedPayment,
                },
                {
                  ...tokenTransferBase,
                  milestoneIndex: 1,
                  amount: completionPayment,
                },
              ]
            } else {
              // there is only one payment, conditional on whether message is Advance or Completion
              milestones = [
                {
                  index: 0,
                  title:
                    values.paymentTerms === PaymentTerm.ON_AGREEMENT
                      ? MILESTONE_COPY.UPFRONT_PAYMENT
                      : MILESTONE_COPY.COMPLETION_PAYMENT, // if terms are not ON_ARGEEMENT, they are AFTER_COMPLETION
                },
              ]
              payments = [
                {
                  ...tokenTransferBase,
                  milestoneIndex: 0,
                  amount: parseFloat(values.paymentAmount),
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
                ...(parseFloat(values.advancedPaymentPercentage) > 0 && {
                  advancePaymentPercentage: parseFloat(values.advancedPaymentPercentage),
                }),
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

          const unFilledProposalFields =
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

          return (
            <form onSubmit={handleSubmit} className="mt-20">
              <div className="rounded-2xl border border-concrete p-6 h-[560px] overflow-y-scroll">
                {isLoading ? (
                  <ProposalCreationLoadingScreen
                    createdProposal={createdProposal}
                    proposalShouldSendLater={proposalShouldSendLater}
                  />
                ) : (
                  <>
                    <h2 className="text-marble-white text-xl font-bold">
                      {PROPOSAL_FORM_HEADER_COPY[proposalStep]}
                    </h2>
                    {proposalStep === ProposalFormStep.PROPOSE && (
                      <FundingFormStepPropose
                        proposingAs={proposingAs}
                        setProposingAs={setProposingAs}
                        formState={formState}
                      />
                    )}
                    {proposalStep === ProposalFormStep.REWARDS && (
                      <FundingFormStepReward
                        chainId={(chain?.id as number) || 1}
                        tokenOptions={tokenOptions}
                        refetchTokens={refetchTokens}
                        isImportTokenModalOpen={isImportTokenModalOpen}
                        setIsImportTokenModalOpen={setIsImportTokenModalOpen}
                        selectedToken={selectedToken}
                        setSelectedToken={setSelectedToken}
                        selectedPaymentTerms={selectedPaymentTerms}
                        setSelectedPaymentTerms={setSelectedPaymentTerms}
                        setProposalStep={setProposalStep}
                      />
                    )}
                    {proposalStep === ProposalFormStep.CONFIRM && <ConfirmForm />}
                  </>
                )}
              </div>
              {proposalStep === ProposalFormStep.PROPOSE && (
                <Button
                  isDisabled={unFilledProposalFields}
                  className="my-6 float-right"
                  onClick={async () => {
                    if (!session?.siwe?.address || !activeUser?.address) {
                      toggleWalletModal(true)
                    } else {
                      const contributorAddress =
                        proposingAs === ProposalRoleType.CONTRIBUTOR
                          ? session?.siwe?.address
                          : await resolveEnsAddress(formState.values.contributor?.trim())
                      // if proposing as client, take active user address
                      // otherwise, resolve input ENS or address

                      const clientAddress =
                        proposingAs === ProposalRoleType.CLIENT
                          ? session?.siwe?.address
                          : await resolveEnsAddress(formState.values.client?.trim())

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
                      setProposalStep(ProposalFormStep.REWARDS)
                    }
                  }}
                >
                  Next
                </Button>
              )}
              {proposalStep === ProposalFormStep.REWARDS && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(ProposalFormStep.PROPOSE)}
                    className="cursor-pointer border rounded border-marble-white p-2 self-start"
                  >
                    <BackArrow className="fill-marble-white" />
                  </span>
                  <Button
                    isDisabled={
                      unFilledProposalFields ||
                      !(
                        formState.values.tokenAddress &&
                        formState.values.paymentAmount &&
                        formState.values.paymentTerms &&
                        // terms are ON_AGREEMENT or they are AFTER_COMPLETION && advanced percentage value is valid
                        (formState.values.paymentTerms !== PaymentTerm.ADVANCE_PAYMENT ||
                          !isValidAdvancedPaymentPercentage(
                            formState.values.advancedPaymentPercentage
                          ))
                      )
                    }
                    className="float-right"
                    onClick={() => {
                      if (!session.siwe?.address) {
                        toggleWalletModal(true)
                        return
                      }

                      setProposalStep(ProposalFormStep.CONFIRM)
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
              {proposalStep === ProposalFormStep.CONFIRM && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(ProposalFormStep.REWARDS)}
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
  )
}

export default ProposalFormFunding
