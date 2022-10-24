import React, { useState, useEffect } from "react"
import { Form } from "react-final-form"
import { useRouter, useSession, Routes, useMutation } from "blitz"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import Stepper from "../Stepper"
import BackArrow from "app/core/icons/BackArrow"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import { useConfirmAuthorship } from "app/proposalForm/hooks/useConfirmAuthorship"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"
import { addressesAreEqual } from "../../../core/utils/addressesAreEqual"
import createProposal from "app/proposal/mutations/createProposal"
import { ProposalCreationLoadingScreen } from "../ProposalCreationLoadingScreen"
import { ConfirmForm } from "../ConfirmForm"
import { ProposeFirstStep } from "./proposeForm"
import { ProposalRoleType } from "@prisma/client"

enum FundingProposalStep {
  PROPOSE = "PROPOSE",
  CONFIRM = "CONFIRM",
}

const HeaderCopy = {
  [FundingProposalStep.PROPOSE]: "Propose",
  [FundingProposalStep.CONFIRM]: "Confirm",
}

export const ProposalFormPartnership = ({
  prefillClients,
  prefillContributors,
  prefillTitle,
}: {
  prefillClients: string[]
  prefillContributors: string[]
  prefillTitle: string
}) => {
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
      <Stepper
        activeStep={HeaderCopy[proposalStep]}
        steps={["Propose", "Confirm"]}
        className="mt-10"
      />
      <Form
        initialValues={{
          proposingAs: proposingAs || "",
          client: prefillClients?.[0] || "",
          contributor: prefillContributors?.[0] || "",
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

            try {
              await createProposalMutation({
                contentTitle: values.title,
                contentBody: values.body,
                contributorAddresses: [contributorAddress],
                clientAddresses: [clientAddress],
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
                      {HeaderCopy[proposalStep]}
                    </h2>
                    {proposalStep === FundingProposalStep.PROPOSE && (
                      <ProposeFirstStep proposingAs={proposingAs} setProposingAs={setProposingAs} />
                    )}
                    {proposalStep === FundingProposalStep.CONFIRM && <ConfirmForm />}
                  </>
                )}
              </div>
              {proposalStep === FundingProposalStep.PROPOSE && (
                <Button
                  isDisabled={unFilledProposalFields}
                  className="my-6 float-right"
                  onClick={async () => {
                    let contributorAddress
                    let clientAddress
                    // if proposing as contributor, take active user address
                    // otherwise, resolve input ENS or address
                    if (proposingAs === ProposalRoleType.CONTRIBUTOR) {
                      contributorAddress = session?.siwe?.address
                    } else {
                      contributorAddress = await resolveEnsAddress(
                        formState.values.contributor?.trim()
                      )
                    }
                    // if proposing as client, take active user address
                    // otherwise, resolve input ENS or address
                    if (proposingAs === ProposalRoleType.CLIENT) {
                      clientAddress = session?.siwe?.address
                    } else {
                      clientAddress = await resolveEnsAddress(formState.values.client?.trim())
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
                    setProposalStep(FundingProposalStep.CONFIRM)
                  }}
                >
                  Next
                </Button>
              )}
              {proposalStep === FundingProposalStep.CONFIRM && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(FundingProposalStep.PROPOSE)}
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

export default ProposalFormPartnership
