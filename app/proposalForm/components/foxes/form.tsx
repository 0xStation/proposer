import React, { useState, useEffect } from "react"
import { Form, FormSpy } from "react-final-form"
import {
  useRouter,
  useSession,
  Routes,
  useMutation,
  useQuery,
  useParam,
  useRouterQuery,
} from "blitz"
import Button from "app/core/components/sds/buttons/Button"
import Stepper from "../Stepper"
import BackArrow from "app/core/icons/BackArrow"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import { useConfirmAuthorship } from "app/proposalForm/hooks/useConfirmAuthorship"
import { addressesAreEqual } from "../../../core/utils/addressesAreEqual"
import createProposal from "app/proposal/mutations/createProposal"
import { ProposalCreationLoadingScreen } from "../ProposalCreationLoadingScreen"
import { FoxesProposeFirstStep } from "./proposeForm"
import deleteProposalById from "app/proposal/mutations/deleteProposalById"
import { FoxesConfirmForm } from "./confirmForm"
import { AddressType, ProposalRoleType } from "@prisma/client"
import { mustBeAboveNumWords } from "app/utils/validators"
import {
  addAddressAsRecipientToPayments,
  getClientAddress,
  getFieldValue,
  getMinNumWords,
} from "app/template/utils"
import { RESERVED_KEYS, ProposalTemplateField } from "app/template/types"
import useWarnIfUnsavedChanges from "app/core/hooks/useWarnIfUnsavedChanges"
import getAccountHasMinTokenBalance from "app/token/queries/getAccountHasMinTokenBalance"
import getTemplateById from "app/template/queries/getTemplateById"
import getRfpById from "app/rfp/queries/getRfpById"

enum FundingProposalStep {
  PROPOSE = "PROPOSE",
  CONFIRM = "CONFIRM",
}

const HeaderCopy = {
  [FundingProposalStep.PROPOSE]: "Propose",
  [FundingProposalStep.CONFIRM]: "Confirm",
}

export const FoxesProposalForm = () => {
  const router = useRouter()
  const walletModalOpen = useStore((state) => state.walletModalOpen)
  const setToastState = useStore((state) => state.setToastState)
  const activeUser = useStore((state) => state.activeUser)
  const [proposalStep, setProposalStep] = useState<FundingProposalStep>(FundingProposalStep.PROPOSE)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [proposalShouldSendLater, setProposalShouldSendLater] = useState<boolean>(false)
  const [createdProposal, setCreatedProposal] = useState<Proposal | null>(null)
  const session = useSession({ suspense: false })
  const [
    shouldHandlePostProposalCreationProcessing,
    setShouldHandlePostProposalCreationProcessing,
  ] = useState<boolean>(false)
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false)

  useWarnIfUnsavedChanges(unsavedChanges, () => {
    return confirm("Warning! You have unsaved changes.")
  })

  const templateId = useParam("templateId") as string
  const { rfpId } = useRouterQuery()
  const [template] = useQuery(
    getTemplateById,
    {
      id: templateId as string,
    },
    {
      enabled: !!templateId,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )
  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId as string,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (!data) {
          router.push(Routes.Page404())
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
      minBalance: rfp?.data?.singleTokenGate?.minBalance || "1", // string to pass directly into BigNumber.from in logic check
    },
    {
      enabled: !!activeUser?.address && !!rfp?.data?.singleTokenGate,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )

  const [createProposalMutation] = useMutation(createProposal, {
    onSuccess: (data) => {
      setCreatedProposal(data)
      setUnsavedChanges(false)
      setShouldHandlePostProposalCreationProcessing(true)
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
    onError: (error) => {
      deleteProposalByIdMutation({
        proposalId: createdProposal?.id as string,
      })
      setCreatedProposal(null)

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
        const representingRoles = createdProposal.roles
          ?.filter(
            (role) =>
              // IMPORTANT: filters out multisigs to enable signers to submit proposals without auto-approving
              addressesAreEqual(role.address, session.siwe?.address || "") &&
              role.type !== ProposalRoleType.AUTHOR
          )
          .map((role) => {
            return {
              roleId: role.id,
              // if role's account is WALLET, then one signature is left
              // if role's account is SAFE, then we don't to trigger an approval on send to let the multisig decide, we should revisit this and I am willing to change mind here
              complete: role.account?.addressType === AddressType.WALLET,
            }
          })
        confirmAuthorship({ proposal: createdProposal, representingRoles })
      } else {
        router.push(
          Routes.ViewProposal({
            proposalId: createdProposal.id,
          })
        )
      }
    }
  }, [createdProposal, proposalShouldSendLater, shouldHandlePostProposalCreationProcessing])

  return (
    <div className="max-w-[580px] min-w-[580px] h-full mx-auto">
      <Stepper
        activeStep={HeaderCopy[proposalStep]}
        steps={["Propose", "Confirm"]}
        className="mt-10"
      />
      <Form
        initialValues={{}}
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

            try {
              const contributorAddress = session?.siwe?.address as string

              await createProposalMutation({
                rfpId: rfp?.id,
                contentTitle: `${rfp?.data.content.title} submission`,
                contentBody: values.body,
                authorAddresses: [contributorAddress],
                contributorAddresses: [contributorAddress],
                clientAddresses: [getClientAddress(template?.data?.fields)],
                milestones: getFieldValue(template?.data?.fields, RESERVED_KEYS.MILESTONES),
                payments: addAddressAsRecipientToPayments(
                  template?.data?.fields as ProposalTemplateField[],
                  contributorAddress
                ),
                paymentTerms: getFieldValue(template?.data?.fields, RESERVED_KEYS.PAYMENT_TERMS),
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

          const minNumWords = getMinNumWords(template?.data?.fields)

          const unFilledProposalFields =
            !formState.values.body || !!mustBeAboveNumWords(minNumWords)(formState.values.body)

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
                    } else if (proposalStep === FundingProposalStep.CONFIRM) {
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
                  <ProposalCreationLoadingScreen
                    createdProposal={createdProposal}
                    proposalShouldSendLater={proposalShouldSendLater}
                  />
                ) : (
                  <>
                    <h2 className="text-marble-white text-xl font-bold">
                      {HeaderCopy[proposalStep]}
                    </h2>
                    {proposalStep === FundingProposalStep.PROPOSE && <FoxesProposeFirstStep />}
                    {proposalStep === FundingProposalStep.CONFIRM && (
                      <FoxesConfirmForm body={formState.values.body} />
                    )}
                  </>
                )}
              </div>
              {proposalStep === FundingProposalStep.PROPOSE && (
                <div className="my-6 float-right flex flex-col space-y-1 items-end">
                  <Button
                    isDisabled={
                      unFilledProposalFields ||
                      (!!rfp?.data?.singleTokenGate &&
                        (isTokenGatingCheckLoading ||
                          (isTokenGatingCheckComplete && !userHasRequiredToken)))
                    }
                    isLoading={isTokenGatingCheckLoading}
                    onClick={async () => {
                      if (!session.siwe?.address) {
                        toggleWalletModal(true)
                      } else if (!!rfp?.data?.singleTokenGate && !userHasRequiredToken) {
                        setToastState({
                          isToastShowing: true,
                          type: "error",
                          message: "You do not own the required tokens to submit to this RFP.",
                        })
                      } else if (session.siwe?.address) {
                        setProposalStep(FundingProposalStep.CONFIRM)
                      }
                    }}
                  >
                    Next
                  </Button>
                  {isTokenGatingCheckComplete && !userHasRequiredToken && (
                    <span className="text-xs text-concrete">
                      Only {rfp?.data?.singleTokenGate?.token?.name} holders can propose to this
                      RFP.
                    </span>
                  )}
                </div>
              )}
              {proposalStep === FundingProposalStep.CONFIRM && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(FundingProposalStep.PROPOSE)}
                    className="cursor-pointer border rounded border-marble-white p-2 self-start"
                  >
                    <BackArrow className="fill-marble-white" />
                  </span>
                  <div className="flex flex-col space-y-1 items-end">
                    <Button
                      isDisabled={
                        isLoading ||
                        unFilledProposalFields ||
                        (!!rfp?.data?.singleTokenGate &&
                          (isTokenGatingCheckLoading ||
                            (isTokenGatingCheckComplete && !userHasRequiredToken)))
                      }
                      isLoading={
                        isTokenGatingCheckLoading || (!proposalShouldSendLater && isLoading)
                      }
                      onClick={async (e) => {
                        e.preventDefault()
                        setIsLoading(true)
                        if (!session.siwe?.address) {
                          toggleWalletModal(true)
                        } else if (!!rfp?.data?.singleTokenGate && !userHasRequiredToken) {
                          setToastState({
                            isToastShowing: true,
                            type: "error",
                            message: "You do not own the required tokens to submit to this RFP.",
                          })
                        } else if (session.siwe?.address) {
                          if (createdProposal) {
                            setShouldHandlePostProposalCreationProcessing(true)
                          } else {
                            await handleSubmit()
                          }
                        }
                      }}
                    >
                      Send proposal
                    </Button>
                    {isTokenGatingCheckComplete && !userHasRequiredToken && (
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

export default FoxesProposalForm
