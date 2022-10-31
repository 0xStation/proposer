import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { useSession } from "@blitzjs/auth"
import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"
import { Form } from "react-final-form"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import FormHeaderStepper from "app/core/components/FormHeaderStepper"
import BackArrow from "app/core/icons/BackArrow"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import { useConfirmAuthorship } from "app/proposalForm/hooks/useConfirmAuthorship"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"
import { addressesAreEqual } from "../../../core/utils/addressesAreEqual"
import createProposal from "app/proposal/mutations/createProposal"
import { ProposalCreationLoadingScreen } from "../ProposalCreationLoadingScreen"
import { ConfirmForm } from "../ConfirmForm"
import IdeaFormStepPropose from "./stepPropose"
import { ProposalFormStep, PROPOSAL_FORM_HEADER_COPY } from "app/core/utils/constants"

export const ProposalFormIdea = ({
  prefillClients,
  prefillTitle,
}: {
  prefillClients: string[]
  prefillTitle: string
}) => {
  const router = useRouter()
  const walletModalOpen = useStore((state) => state.walletModalOpen)
  const setToastState = useStore((state) => state.setToastState)
  const activeUser = useStore((state) => state.activeUser)
  const [proposalStep, setProposalStep] = useState<ProposalFormStep>(ProposalFormStep.PROPOSE)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [proposalShouldSendLater, setProposalShouldSendLater] = useState<boolean>(false)
  const [createdProposal, setCreatedProposal] = useState<Proposal | null>(null)
  const session = useSession({ suspense: false })
  const [
    shouldHandlePostProposalCreationProcessing,
    setShouldHandlePostProposalCreationProcessing,
  ] = useState<boolean>(false)
  const { resolveEnsAddress } = useResolveEnsAddress()

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

  return (
    <div className="max-w-[580px] h-full mx-auto">
      <FormHeaderStepper
        activeStep={PROPOSAL_FORM_HEADER_COPY[proposalStep]}
        steps={["Propose", "Confirm"]}
        className="mt-10"
      />
      <Form
        initialValues={{
          toAddress: prefillClients?.[0] || "",
          title: prefillTitle || "",
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
            if (!session?.siwe?.address) {
              setIsLoading(false)
              setToastState({
                isToastShowing: true,
                type: "error",
                message: "Not signed in, please connect wallet and sign in.",
              })
            }
            const toAddress = await resolveEnsAddress(values.toAddress?.trim())

            try {
              await createProposalMutation({
                contentTitle: values.title,
                contentBody: values.body,
                contributorAddresses: [],
                clientAddresses: [toAddress],
                authorAddresses: [session?.siwe?.address as string],
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
            !formState.values.toAddress || !formState.values.title || !formState.values.body

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
                      <IdeaFormStepPropose formState={formState} />
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
                    if (!session.siwe?.address) {
                      toggleWalletModal(true)
                      return
                    }

                    const toAddress = await resolveEnsAddress(formState.values.toAddress?.trim())

                    if (!toAddress) {
                      setIsLoading(false)
                      setToastState({
                        isToastShowing: true,
                        type: "error",
                        message: "Invalid ENS name or wallet address provided.",
                      })
                      return
                    }

                    if (
                      addressesAreEqual(toAddress, activeUser?.address as string) ||
                      addressesAreEqual(toAddress, session?.siwe?.address as string)
                    ) {
                      setIsLoading(false)
                      setToastState({
                        isToastShowing: true,
                        type: "error",
                        message: "Cannot propose to yourself, please propose to another address.",
                      })
                      return
                    }
                    setProposalStep(ProposalFormStep.CONFIRM)
                  }}
                >
                  Next
                </Button>
              )}
              {proposalStep === ProposalFormStep.CONFIRM && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(ProposalFormStep.PROPOSE)}
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

export default ProposalFormIdea
