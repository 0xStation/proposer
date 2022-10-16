import React, { useState, useEffect } from "react"
import { Form } from "react-final-form"
import {
  useRouter,
  useSession,
  Routes,
  useMutation,
  useParam,
  useQuery,
  useRouterQuery,
} from "blitz"
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
import { FoxesProposeFirstStep } from "./proposeForm"
import createProposalToFoxesRfp from "app/proposal/mutations/createProposalToFoxesRfp"
import deleteProposalById from "app/proposal/mutations/deleteProposalById"
import getRfpById from "app/rfp/queries/getRfpById"
import { FoxesConfirmForm } from "./confirmForm"
import useGetUsersRolesToSignFor from "app/core/hooks/useGetUsersRolesToSignFor"
import { AddressType, ProposalRoleType } from "@prisma/client"
import { mustBeAboveNumWords } from "app/utils/validators"

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
  const { resolveEnsAddress } = useResolveEnsAddress()

  const queryParams = useRouterQuery()
  const rfpId = queryParams?.rfpId as string
  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute in milliseconds
    }
  )

  const [createProposalToFoxesRfpMutation] = useMutation(createProposalToFoxesRfp, {
    onSuccess: (data) => {
      setCreatedProposal(data)
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
    <div className="max-w-[580px] h-full mx-auto">
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
              await createProposalToFoxesRfpMutation({
                rfpId,
                contentTitle: `${rfp?.data.content.title} submission`,
                contentBody: values.body,
                authorAddress: session?.siwe?.address as string,
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

          const FOXES_MIN_NUM_WORDS = 125

          const unFilledProposalFields =
            !formState.values.body ||
            !!mustBeAboveNumWords(FOXES_MIN_NUM_WORDS)(formState.values.body)

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
                      <FoxesProposeFirstStep minNumWords={FOXES_MIN_NUM_WORDS} />
                    )}
                    {proposalStep === FundingProposalStep.CONFIRM && (
                      <FoxesConfirmForm body={formState.values.body} />
                    )}
                  </>
                )}
              </div>
              {proposalStep === FundingProposalStep.PROPOSE && (
                <Button
                  isDisabled={unFilledProposalFields}
                  className="my-6 float-right"
                  onClick={async () => {
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

export default FoxesProposalForm
