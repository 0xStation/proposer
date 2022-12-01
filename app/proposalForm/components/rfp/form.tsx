import React, { useState, useEffect } from "react"
import { Form, FormSpy } from "react-final-form"
import { useRouter } from "next/router"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useParam, Routes } from "@blitzjs/next"
import { useSession } from "@blitzjs/auth"
import Button from "app/core/components/sds/buttons/Button"
import FormHeaderStepper from "app/core/components/FormHeaderStepper"
import BackArrow from "app/core/icons/BackArrow"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import { useConfirmAuthorship } from "app/proposalForm/hooks/useConfirmAuthorship"
import { addressesAreEqual } from "../../../core/utils/addressesAreEqual"
import createProposal from "app/proposal/mutations/createProposal"
import { ProposalCreationLoadingScreen } from "../ProposalCreationLoadingScreen"
import deleteProposalById from "app/proposal/mutations/deleteProposalById"
import RfpProposalFormStepPropose from "./stepPropose"
import RfpProposalFormStepConfirm from "./stepConfirm"
import { AddressType, ProposalRoleType, TokenType } from "@prisma/client"
import useWarnIfUnsavedChanges from "app/core/hooks/useWarnIfUnsavedChanges"
import getAccountHasMinTokenBalance from "app/token/queries/getAccountHasMinTokenBalance"
import getRfpById from "app/rfp/queries/getRfpById"
import { ProposalFormStep, PROPOSAL_FORM_HEADER_COPY } from "app/core/utils/constants"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"
import { SocialConnection } from "app/rfp/types"
import { generateMilestonePayments } from "app/proposal/utils"
import RfpProposalFormStepReward from "./stepReward"
import getTokensByAccount from "app/token/queries/getTokensByAccount"
import { useNetwork } from "wagmi"
import { getNetworkTokens } from "app/core/utils/networkInfo"

export const ProposalFormRfp = () => {
  const router = useRouter()
  const walletModalOpen = useStore((state) => state.walletModalOpen)
  const setToastState = useStore((state) => state.setToastState)
  const activeUser = useStore((state) => state.activeUser)
  const [proposalStep, setProposalStep] = useState<ProposalFormStep>(ProposalFormStep.PROPOSE)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [createdProposal, setCreatedProposal] = useState<Proposal | null>(null)
  const session = useSession({ suspense: false })
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false)
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string>("")
  const [tokenOptions, setTokenOptions] = useState<any[]>()
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<any>()

  const { chain } = useNetwork()

  useWarnIfUnsavedChanges(unsavedChanges, () => {
    return confirm("Warning! You have unsaved changes.")
  })

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
      onSuccess: (data) => {
        if (!data) {
          router.push(Routes.Page404())
        }
        if (!selectedToken) {
          setSelectedToken(data?.data?.proposal?.payment?.token)
        }
      },
      onError: (data) => {
        if (!data) {
          router.push(Routes.Page404())
        }
      },
    }
  )

  const [
    userHasRequiredToken,
    { isLoading: isTokenGatingCheckLoading, isSuccess: isTokenGatingCheckComplete },
  ] = useQuery(
    getAccountHasMinTokenBalance,
    {
      chainId: rfp?.data?.singleTokenGate?.token?.chainId as number,
      tokenAddress: rfp?.data?.singleTokenGate?.token?.address as string,
      accountAddress: activeUser?.address as string,
      minBalance:
        decimalToBigNumber(
          rfp?.data?.singleTokenGate?.minBalance || 0,
          rfp?.data?.singleTokenGate?.token?.decimals || 0
        ).toString() || "1", // string to pass directly into BigNumber.from in logic check
    },
    {
      enabled: !!activeUser?.address && !!rfp?.data?.singleTokenGate,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )

  const [savedUserTokens, { refetch: refetchTokens }] = useQuery(
    getTokensByAccount,
    {
      chainId: chain?.id || 1,
      userId: session?.userId as number,
    },
    {
      suspense: false,
      enabled: Boolean(chain && session?.userId),
      staleTime: 60 * 1000, // 1 minute
    }
  )

  useEffect(() => {
    if (chain?.id) {
      const networkTokens = getNetworkTokens(chain?.id || 1)
      // sets options for reward token dropdown. includes default tokens and
      // tokens that the user has imported to their account
      setTokenOptions([
        ...networkTokens,
        ...(savedUserTokens?.filter(
          (token) => token.chainId === chain?.id && token.type === TokenType.ERC20
        ) || []),
      ])
    }
  }, [chain?.id])

  const [createProposalMutation] = useMutation(createProposal, {
    onSuccess: (data) => {
      setCreatedProposal(data)
      setUnsavedChanges(false)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const [deleteProposalByIdMutation] = useMutation(deleteProposalById, {
    onSuccess: (_data) => {
      console.log("proposal deleted: ", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const { confirmAuthorship } = useConfirmAuthorship({
    onSuccess: (updatedProposal) => {
      router.push(
        Routes.ViewProposal({
          proposalId: updatedProposal?.id,
        })
      )
    },
    onError: (error, proposal) => {
      deleteProposalByIdMutation({
        proposalId: proposal?.id as string,
      })
      setCreatedProposal(null)

      setIsLoading(false)
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: error.message,
      })
    },
  })

  useEffect(() => {
    if (!walletModalOpen && isLoading) {
      setIsLoading(false)
    }
  }, [walletModalOpen])

  const missingRequiredToken = !!rfp?.data?.singleTokenGate && !userHasRequiredToken
  const missingRequiredDiscordConnection =
    rfp?.data?.requiredSocialConnections?.includes(SocialConnection.DISCORD) &&
    activeUser &&
    !activeUser?.discordId

  const invalidRequirements =
    // proposing to own RFP
    addressesAreEqual(session?.siwe?.address as string, rfp?.accountAddress as string) ||
    // has not connected account or account with Discord requirement (if requirement exists)
    missingRequiredDiscordConnection ||
    // has not connected wallet with token requirement (if requirement exists)
    missingRequiredToken

  return (
    <div className="max-w-[580px] min-w-[580px] h-full mx-auto">
      <FormHeaderStepper
        activeStep={PROPOSAL_FORM_HEADER_COPY[proposalStep]}
        steps={[
          PROPOSAL_FORM_HEADER_COPY[ProposalFormStep.PROPOSE],
          PROPOSAL_FORM_HEADER_COPY[ProposalFormStep.PAYMENT],
          PROPOSAL_FORM_HEADER_COPY[ProposalFormStep.CONFIRM],
        ]}
        className="mt-10"
      />
      <Form
        initialValues={{
          title: `"${rfp?.data?.content?.title}" submission`,
          body: rfp?.data?.proposal?.body?.prefill,
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
            // User not signed in
            if (!session?.siwe?.address) {
              setIsLoading(false)
              setToastState({
                isToastShowing: true,
                type: "error",
                message: "Not signed in, please connect wallet and sign in.",
              })
              return
            }
            // RFP missing for uknown reason
            if (!rfp) {
              setIsLoading(false)
              setToastState({
                isToastShowing: true,
                type: "error",
                message: "No RFP found.",
              })
              return
            }
            // User proposing to their own RFP
            if (
              addressesAreEqual(session?.siwe?.address as string, rfp?.accountAddress as string)
            ) {
              setIsLoading(false)
              setToastState({
                isToastShowing: true,
                type: "error",
                message: "Cannot propose to your own RFP.",
              })
              return
            }

            const connectedAddress = session?.siwe?.address as string

            let contributorAddress
            let clientAddress
            if (rfp?.data?.proposal?.proposerRole === ProposalRoleType.CLIENT) {
              clientAddress = connectedAddress
              contributorAddress = rfp.accountAddress
            } else if (rfp?.data?.proposal?.proposerRole === ProposalRoleType.CONTRIBUTOR) {
              clientAddress = rfp.accountAddress
              contributorAddress = connectedAddress
            }

            let newProposal

            try {
              const paymentToken = rfp?.data?.proposal?.payment?.token || selectedToken
              const paymentAmount = values.paymentAmount || rfp?.data?.proposal?.payment?.minAmount
              const paymentTerms = rfp?.data?.proposal?.payment?.terms || values.paymentTerms
              const advancePaymentPercentage =
                parseFloat(values.advancePaymentPercentage) ||
                rfp?.data?.proposal?.payment?.advancePaymentPercentage

              const { milestones, payments } = generateMilestonePayments(
                clientAddress,
                contributorAddress,
                paymentToken,
                paymentToken.chainId,
                paymentAmount,
                paymentTerms,
                advancePaymentPercentage
              )
              newProposal = await createProposalMutation({
                rfpId: rfp?.id,
                contentTitle: values.title,
                contentBody: values.body,
                authorAddresses: [connectedAddress],
                contributorAddresses: [contributorAddress],
                clientAddresses: [clientAddress],
                milestones,
                payments,
                paymentTerms,
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

            try {
              const representingParticipants = newProposal.participants
                ?.filter((participant) =>
                  // IMPORTANT: filters out multisigs to enable signers to submit proposals without auto-approving
                  addressesAreEqual(participant.accountAddress, session.siwe?.address || "")
                )
                .map((participant) => {
                  return {
                    participantId: participant.id,
                    // if participant's account is WALLET, then one signature is left
                    // if participant's account is SAFE, then we don't to trigger an approval on send to let the multisig decide, we should revisit this and I am willing to change mind here
                    complete: participant.account?.addressType === AddressType.WALLET,
                  }
                })
              await confirmAuthorship({ proposal: newProposal, representingParticipants })
            } catch (err) {
              setIsLoading(false)
              setToastState({
                isToastShowing: true,
                type: "error",
                message: err.message,
              })
            }
          }
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <form onSubmit={handleSubmit} className="mt-20">
              <FormSpy
                subscription={{ dirty: true }}
                onChange={({ dirty }) => {
                  // purpose of this logic is to show the on page leave pop-up
                  // if user has unsaved changes and the form is dirty
                  if (isTokenGatingCheckComplete && !userHasRequiredToken) {
                    // don't show pop up alert if user can't propose in the first place
                    // given they don't have the permissions
                    return
                  }
                  // The presence of the createdProposal means their form data is already saved
                  if (!createdProposal) {
                    if (dirty && !unsavedChanges) {
                      setUnsavedChanges(true)
                    } else if (proposalStep === ProposalFormStep.CONFIRM) {
                      // currently there are no fields on the form so formspy indicates
                      // that the form is pristine when it's not rendered
                      setUnsavedChanges(true)
                    } else if (!dirty && unsavedChanges) {
                      setUnsavedChanges(false)
                    }
                  }
                }}
              />
              <div className="rounded-2xl border border-concrete p-6 h-[560px] overflow-y-scroll">
                {isLoading ? (
                  <ProposalCreationLoadingScreen createdProposal={createdProposal} />
                ) : (
                  <>
                    <h2 className="text-marble-white text-xl font-bold">
                      {PROPOSAL_FORM_HEADER_COPY[proposalStep]}
                    </h2>
                    {proposalStep === ProposalFormStep.PROPOSE && (
                      <RfpProposalFormStepPropose formState={formState} />
                    )}
                    {proposalStep === ProposalFormStep.PAYMENT && (
                      <RfpProposalFormStepReward
                        selectedPaymentTerms={selectedPaymentTerms}
                        setSelectedPaymentTerms={setSelectedPaymentTerms}
                        tokenOptions={tokenOptions}
                        isImportTokenModalOpen={isImportTokenModalOpen}
                        selectedToken={selectedToken}
                        setTokenOptions={setTokenOptions}
                        setIsImportTokenModalOpen={setIsImportTokenModalOpen}
                        setSelectedToken={setSelectedToken}
                        refetchTokens={refetchTokens}
                        chainId={chain?.id}
                      />
                    )}
                    {proposalStep === ProposalFormStep.CONFIRM && (
                      <RfpProposalFormStepConfirm
                        formState={formState}
                        selectedToken={selectedToken}
                      />
                    )}
                  </>
                )}
              </div>
              {proposalStep === ProposalFormStep.PROPOSE && (
                <div className="my-6 float-right flex flex-col space-y-1 items-end">
                  <Button
                    isDisabled={formState.invalid || invalidRequirements}
                    isLoading={
                      // query enabled
                      !!activeUser?.address &&
                      !!rfp?.data?.singleTokenGate &&
                      // query is loading
                      isTokenGatingCheckLoading
                    }
                    onClick={async (e) => {
                      e.preventDefault()
                      if (!session.siwe?.address) {
                        toggleWalletModal(true)
                      } else if (!!rfp?.data?.singleTokenGate && !userHasRequiredToken) {
                        setToastState({
                          isToastShowing: true,
                          type: "error",
                          message: "You do not own the required tokens to submit to this RFP.",
                        })
                      } else if (session.siwe?.address) {
                        setProposalStep(ProposalFormStep.PAYMENT)
                      }
                    }}
                  >
                    Next
                  </Button>
                  {addressesAreEqual(
                    session?.siwe?.address as string,
                    rfp?.accountAddress as string
                  ) && (
                    <span className="text-xs text-concrete">
                      You cannot propose to your own RFP.
                    </span>
                  )}
                  {missingRequiredDiscordConnection && (
                    <span className="text-xs text-concrete">Missing connection to Discord.</span>
                  )}
                  {missingRequiredToken && (
                    <span className="text-xs text-concrete">
                      Only {rfp?.data?.singleTokenGate?.token?.name} holders can propose to this
                      RFP.
                    </span>
                  )}
                </div>
              )}
              {proposalStep === ProposalFormStep.PAYMENT && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(ProposalFormStep.PROPOSE)}
                    className="cursor-pointer border rounded border-marble-white p-2 self-start"
                  >
                    <BackArrow className="fill-marble-white" />
                  </span>
                  <div className="flex flex-col space-y-1 items-end">
                    <Button
                      isDisabled={formState.invalid || invalidRequirements}
                      isLoading={
                        // query enabled
                        !!activeUser?.address &&
                        !!rfp?.data?.singleTokenGate &&
                        // query is loading
                        isTokenGatingCheckLoading
                      }
                      onClick={async (e) => {
                        e.preventDefault()
                        if (!session.siwe?.address) {
                          toggleWalletModal(true)
                        } else if (!!rfp?.data?.singleTokenGate && !userHasRequiredToken) {
                          setToastState({
                            isToastShowing: true,
                            type: "error",
                            message: "You do not own the required tokens to submit to this RFP.",
                          })
                        } else if (session.siwe?.address) {
                          setProposalStep(ProposalFormStep.CONFIRM)
                        }
                      }}
                    >
                      Next
                    </Button>
                    {addressesAreEqual(
                      session?.siwe?.address as string,
                      rfp?.accountAddress as string
                    ) && (
                      <span className="text-xs text-concrete">
                        You cannot propose to your own RFP.
                      </span>
                    )}
                    {missingRequiredDiscordConnection && (
                      <span className="text-xs text-concrete">Missing connection to Discord.</span>
                    )}
                    {missingRequiredToken && (
                      <span className="text-xs text-concrete">
                        Only {rfp?.data?.singleTokenGate?.token?.name} holders can propose to this
                        RFP.
                      </span>
                    )}
                  </div>
                </div>
              )}
              {proposalStep === ProposalFormStep.CONFIRM && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(ProposalFormStep.PAYMENT)}
                    className="cursor-pointer border rounded border-marble-white p-2 self-start"
                  >
                    <BackArrow className="fill-marble-white" />
                  </span>
                  <div className="flex flex-col space-y-1 items-end">
                    <Button
                      isDisabled={isLoading || formState.invalid || invalidRequirements}
                      isLoading={
                        // query enabled
                        (!!activeUser?.address &&
                          !!rfp?.data?.singleTokenGate &&
                          // query is loading
                          isTokenGatingCheckLoading) ||
                        isLoading
                      }
                      onClick={async (e) => {
                        e.preventDefault()
                        setIsLoading(true)
                        if (!session.siwe?.address) {
                          toggleWalletModal(true)
                          setIsLoading(false)
                          return
                        } else if (!!rfp?.data?.singleTokenGate && !userHasRequiredToken) {
                          setToastState({
                            isToastShowing: true,
                            type: "error",
                            message: "You do not own the required tokens to submit to this RFP.",
                          })
                          setIsLoading(false)
                          return
                        } else if (session.siwe?.address) {
                          await handleSubmit()
                        }
                      }}
                    >
                      Send proposal
                    </Button>
                    {addressesAreEqual(
                      session?.siwe?.address as string,
                      rfp?.accountAddress as string
                    ) && (
                      <span className="text-xs text-concrete">
                        You cannot propose to your own RFP.
                      </span>
                    )}
                    {missingRequiredDiscordConnection && (
                      <span className="text-xs text-concrete">Missing connection to Discord.</span>
                    )}
                    {missingRequiredToken && (
                      <span className="text-xs text-concrete">
                        Only {rfp?.data?.singleTokenGate?.token?.name} holders can propose to this
                        RFP.
                      </span>
                    )}
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

export default ProposalFormRfp
