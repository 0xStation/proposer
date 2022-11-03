import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useSession } from "@blitzjs/auth"
import { Form } from "react-final-form"
import { useNetwork } from "wagmi"
import { ProposalRoleType, TokenType } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import FormHeaderStepper from "app/core/components/FormHeaderStepper"
import getTokensByAccount from "app/token/queries/getTokensByAccount"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import RfpFormStepPropose from "./stepGeneral"
// import RfpFormStepPayment from "./stepReward"
import { Proposal } from "app/proposal/types"
import BackArrow from "app/core/icons/BackArrow"
import useStore from "app/core/hooks/useStore"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { PaymentTerm } from "app/proposalPayment/types"
import { RfpFormStep, RFP_FORM_HEADER_COPY } from "app/core/utils/constants"
import {
  isPositiveAmount,
  isValidAdvancedPaymentPercentage,
  isValidTokenAmount,
} from "app/utils/validators"
import RfpFormStepPayment from "./stepPayment"
import RfpFormStepPermission from "./stepPermissions"
import { FormLoadingScreen } from "app/core/components/FormLoadingScreen"
import createRfp from "app/rfp/mutations/createRfp"
import { PaymentDirection } from "app/rfp/types"
import { ProposalTemplateFieldValidationName } from "app/template/types"
import { formatPositiveInt } from "app/utils/formatters"

export const RfpForm = () => {
  const setToastState = useStore((state) => state.setToastState)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const walletModalOpen = useStore((state) => state.walletModalOpen)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [proposalStep, setProposalStep] = useState<RfpFormStep>(RfpFormStep.GENERAL)

  // GENERAL step

  // payment directoin in parent form state because it gets reset when flipping through steps
  const [selectedBodyValidation, setSelectedBodyValidation] = useState<string>("")

  // PAYMENT step

  // payment directoin in parent form state because it gets reset when flipping through steps
  const [selectedPaymentDirection, setSelectedPaymentDirection] = useState<string>("")
  const [paymentTokenOptions, setPaymentTokenOptions] = useState<any[]>()
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<any>()
  // payment terms in parent form state because it gets reset when flipping through steps if put in the rewards form
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string>("")

  // PERMISSION step

  const [permissionTokenOptions, setPermissionTokenOptions] = useState<any[]>()
  const [selectedSubmissionToken, setSelectedSubmissionToken] = useState<any>()

  // other
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const router = useRouter()

  const { chain } = useNetwork()

  const [createRfpMutation] = useMutation(createRfp, {
    onSuccess: (data) => {
      console.log(data)
      router.push(Routes.RfpDetail({ rfpId: data?.id as string }))
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
    { suspense: false, enabled: Boolean(chain && session?.userId), staleTime: 30 * 1000 }
  )

  useEffect(() => {
    if (chain?.id) {
      const networkTokens = getNetworkTokens(chain?.id || 1)
      const userTokens = savedUserTokens?.filter((token) => token.chainId === chain?.id)
      // sets options for reward token dropdown. includes default tokens and
      // tokens that the user has imported to their account
      setPaymentTokenOptions([
        ...networkTokens,
        // only support payments with ERC20 right now
        ...(userTokens?.filter((token) => token.type === TokenType.ERC20) || []),
      ])
      // only token gate on user-defined tokens
      setPermissionTokenOptions(userTokens || [])
    }
  }, [chain?.id, savedUserTokens])

  return (
    <div className="max-w-[580px] h-full mx-auto">
      <FormHeaderStepper
        activeStep={RFP_FORM_HEADER_COPY[proposalStep]}
        steps={[
          RFP_FORM_HEADER_COPY[RfpFormStep.GENERAL],
          RFP_FORM_HEADER_COPY[RfpFormStep.PAYMENT],
          RFP_FORM_HEADER_COPY[RfpFormStep.PERMISSIONS],
        ]}
        className="mt-10"
      />
      <Form
        initialValues={{}}
        onSubmit={async (values: any, form) => {
          const clientAddress =
            values.paymentDirection === PaymentDirection.AUTHOR_IS_SENDER
              ? session.siwe?.address
              : undefined

          const contributorAddress =
            values.paymentDirection === PaymentDirection.AUTHOR_IS_RECIPIENT
              ? session.siwe?.address
              : undefined

          try {
            await createRfpMutation({
              title: values.title,
              body: values.body,
              associatedAccountAddress: session.siwe?.address as string,
              preselectClientAddress: clientAddress,
              preselectContributorAddress: contributorAddress,
              payment: {
                token: { ...selectedToken, chainId: chain?.id || 1 },
                amount: parseFloat(values.paymentAmount),
                terms: values.paymentTerms,
                advancePaymentPercentage: values.advancePaymentPercentage,
              },
              singleTokenGate: !!selectedSubmissionToken
                ? { token: selectedSubmissionToken, minBalance: values.submissionTokenMinBalance }
                : undefined,
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
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()

          const missingFieldsGeneral =
            !formState.values.title ||
            !formState.values.body ||
            (formState.values.bodyValidation === ProposalTemplateFieldValidationName.MIN_WORDS &&
              !formatPositiveInt(formState.values.minWordCount))

          const missingFieldsPayment =
            !formState.values.paymentDirection ||
            !formState.values.tokenAddress ||
            !formState.values.paymentAmount ||
            !formState.values.paymentTerms ||
            !(
              formState.values.paymentTerms !== PaymentTerm.ADVANCE_PAYMENT ||
              // isValidAdvancedPaymentPercentage returns string if there is an error or undefined if things are okay
              !isValidAdvancedPaymentPercentage(formState.values.advancedPaymentPercentage)
            )

          const missingFieldsPermissions = !(
            !selectedSubmissionToken ||
            // isValidTokenAmount returns string if error or undefined if all good
            !isValidTokenAmount(selectedSubmissionToken?.decimals)(
              formState.values.submissionTokenMinBalance
            )
          )

          return (
            <form onSubmit={handleSubmit} className="mt-20">
              <div className="rounded-2xl border border-concrete p-6 h-[560px] overflow-y-scroll">
                {isLoading ? (
                  <FormLoadingScreen />
                ) : (
                  <>
                    <h2 className="text-marble-white text-xl font-bold">
                      {RFP_FORM_HEADER_COPY[proposalStep]}
                    </h2>
                    {proposalStep === RfpFormStep.GENERAL && (
                      <RfpFormStepPropose
                        formState={formState}
                        selectedBodyValidation={selectedBodyValidation}
                        setSelectedBodyValidation={setSelectedBodyValidation}
                      />
                    )}
                    {proposalStep === RfpFormStep.PAYMENT && (
                      <RfpFormStepPayment
                        chainId={(chain?.id as number) || 1}
                        paymentTokenOptions={paymentTokenOptions}
                        refetchTokens={refetchTokens}
                        isImportTokenModalOpen={isImportTokenModalOpen}
                        setIsImportTokenModalOpen={setIsImportTokenModalOpen}
                        selectedToken={selectedToken}
                        setSelectedToken={setSelectedToken}
                        selectedPaymentDirection={selectedPaymentDirection}
                        setSelectedPaymentDirection={setSelectedPaymentDirection}
                        selectedPaymentTerms={selectedPaymentTerms}
                        setSelectedPaymentTerms={setSelectedPaymentTerms}
                        setProposalStep={setProposalStep}
                      />
                    )}
                    {proposalStep === RfpFormStep.PERMISSIONS && (
                      <RfpFormStepPermission
                        permissionTokenOptions={permissionTokenOptions}
                        selectedSubmissionToken={selectedSubmissionToken}
                        setSelectedSubmissionToken={setSelectedSubmissionToken}
                        isImportTokenModalOpen={isImportTokenModalOpen}
                        setIsImportTokenModalOpen={setIsImportTokenModalOpen}
                        setProposalStep={setProposalStep}
                        chainId={(chain?.id as number) || 1}
                        refetchTokens={refetchTokens}
                      />
                    )}
                  </>
                )}
              </div>
              {proposalStep === RfpFormStep.GENERAL && (
                <Button
                  isDisabled={missingFieldsGeneral}
                  className="my-6 float-right"
                  onClick={async () => {
                    if (!session?.siwe?.address || !activeUser?.address) {
                      toggleWalletModal(true)
                    } else {
                      setProposalStep(RfpFormStep.PAYMENT)
                    }
                  }}
                >
                  Next
                </Button>
              )}
              {proposalStep === RfpFormStep.PAYMENT && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(RfpFormStep.GENERAL)}
                    className="cursor-pointer border rounded border-marble-white p-2 self-start"
                  >
                    <BackArrow className="fill-marble-white" />
                  </span>
                  <Button
                    isDisabled={missingFieldsPayment}
                    className="float-right"
                    onClick={() => {
                      if (!session.siwe?.address) {
                        toggleWalletModal(true)
                        return
                      }

                      setProposalStep(RfpFormStep.PERMISSIONS)
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
              {proposalStep === RfpFormStep.PERMISSIONS && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(RfpFormStep.PAYMENT)}
                    className="cursor-pointer border rounded border-marble-white p-2 self-start"
                  >
                    <BackArrow className="fill-marble-white" />
                  </span>
                  <div>
                    <Button
                      isDisabled={isLoading || missingFieldsPermissions}
                      isLoading={isLoading}
                      onClick={async (e) => {
                        e.preventDefault()
                        if (session.siwe?.address) {
                          setIsLoading(true)
                          await handleSubmit()
                        } else {
                          toggleWalletModal(true)
                        }
                      }}
                    >
                      Create RFP
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

export default RfpForm
