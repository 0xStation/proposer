import React, { useState, useEffect } from "react"
import { Form } from "react-final-form"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { useSession } from "@blitzjs/auth"
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
import { ProposalRoleType } from "@prisma/client"
import PartnershipFormStepPropose from "./stepPropose"
import PartnershipFormStepConfirm from "./stepConfirm"
import { ProposalFormStep, PROPOSAL_FORM_HEADER_COPY } from "app/core/utils/constants"
import deleteProposalById from "app/proposal/mutations/deleteProposalById"

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
  const [proposalStep, setProposalStep] = useState<ProposalFormStep>(ProposalFormStep.PROPOSE)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const [isLoading, setIsLoading] = useState<boolean>(false)
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
  const { resolveEnsAddress } = useResolveEnsAddress()

  const [deleteProposalByIdMutation] = useMutation(deleteProposalById, {
    onSuccess: (_data) => {
      console.log("proposal deleted: ", _data)
    },
    onError: (error: Error) => {
      setCreatedProposal(null)
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

  const [createProposalMutation] = useMutation(createProposal, {
    onSuccess: (data) => {
      setCreatedProposal(data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  useEffect(() => {
    if (!walletModalOpen && isLoading) {
      setIsLoading(false)
    }
  }, [walletModalOpen])

  return (
    <div className="max-w-[580px] h-full mx-auto">
      <FormHeaderStepper
        activeStep={PROPOSAL_FORM_HEADER_COPY[proposalStep]}
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
          if (!session?.siwe?.address) {
            setIsLoading(false)
            setToastState({
              isToastShowing: true,
              type: "error",
              message: "Not signed in, please connect wallet and sign in.",
            })
            return
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

          let newProposal
          try {
            newProposal = await createProposalMutation({
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

          try {
            await confirmAuthorship({
              proposal: newProposal,
              representingRoles: [],
            })
          } catch (err) {
            setIsLoading(false)
            setToastState({
              isToastShowing: true,
              type: "error",
              message: err.message,
            })
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
                  <ProposalCreationLoadingScreen createdProposal={createdProposal} />
                ) : (
                  <>
                    <h2 className="text-marble-white text-xl font-bold">
                      {PROPOSAL_FORM_HEADER_COPY[proposalStep]}
                    </h2>
                    {proposalStep === ProposalFormStep.PROPOSE && (
                      <PartnershipFormStepPropose
                        proposingAs={proposingAs}
                        setProposingAs={setProposingAs}
                        formState={formState}
                      />
                    )}
                    {proposalStep === ProposalFormStep.CONFIRM && (
                      <PartnershipFormStepConfirm formState={formState} />
                    )}
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
                      isDisabled={isLoading}
                      isLoading={isLoading}
                      onClick={async (e) => {
                        e.preventDefault()
                        setIsLoading(true)
                        if (session.siwe?.address) {
                          await handleSubmit()
                        } else {
                          toggleWalletModal(true)
                        }
                      }}
                    >
                      Create proposal
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
