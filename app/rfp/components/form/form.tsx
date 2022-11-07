// PACKAGE
import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { Routes, useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useSession } from "@blitzjs/auth"
import { Form } from "react-final-form"
import { useNetwork } from "wagmi"
import { TokenType } from "@prisma/client"
// CORE
import Button from "app/core/components/sds/buttons/Button"
import FormHeaderStepper from "app/core/components/FormHeaderStepper"
import { FormLoadingScreen } from "app/core/components/FormLoadingScreen"
import useUserHasPermissionOfAddress from "app/core/hooks/useUserHasPermissionOfAddress"
import BackArrow from "app/core/icons/BackArrow"
import useStore from "app/core/hooks/useStore"
import { RfpFormStep, RFP_FORM_HEADER_COPY } from "app/core/utils/constants"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import { formatPositiveInt } from "app/utils/formatters"
import { isValidAdvancedPaymentPercentage, isValidTokenAmount } from "app/utils/validators"
// MODULE
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { PaymentTerm } from "app/proposalPayment/types"
import createRfp from "app/rfp/mutations/createRfp"
import { PaymentDirection } from "app/rfp/types"
import { ProposalTemplateFieldValidationName } from "app/template/types"
import getTokensByAccount from "app/token/queries/getTokensByAccount"
// LOCAL
import RfpFormStepRfp from "./stepRfp"
import RfpFormStepPayment from "./stepPayment"
import RfpFormStepPermission from "./stepPermissions"

export const RfpForm = () => {
  const accountAddress = useParam("accountAddress", "string") as string
  const setToastState = useStore((state) => state.setToastState)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [proposalStep, setProposalStep] = useState<RfpFormStep>(RfpFormStep.RFP)

  // PAYMENT step

  // payment directoin in parent form state because it gets reset when flipping through steps
  const [selectedPaymentDirection, setSelectedPaymentDirection] = useState<string>("")
  const [paymentTokenOptions, setPaymentTokenOptions] = useState<any[]>()
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<any>()
  // payment terms in parent form state because it gets reset when flipping through steps if put in the rewards form
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string>("")

  // REQUIREMENTS step

  const [wordCountRequirement, setWordCountRequirement] = useState<string>("")
  const [permissionTokenOptions, setPermissionTokenOptions] = useState<any[]>()
  const [selectedSubmissionToken, setSelectedSubmissionToken] = useState<any>()

  // other
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const router = useRouter()

  const { chain } = useNetwork()

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    {
      enabled: !!accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
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

  // checks if session address is page's account address or is a signer of the account's Safe
  const { hasPermissionOfAddress: userCanPostRfpForAccount } = useUserHasPermissionOfAddress(
    accountAddress,
    account?.addressType,
    account?.data?.chainId
  )

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
      userId: account?.id, // get tokens by account id so that different authors for the same workspace can share previously made tokens for the workspace
    },
    { suspense: false, enabled: Boolean(chain?.id && account?.id), staleTime: 30 * 1000 }
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
          RFP_FORM_HEADER_COPY[RfpFormStep.RFP],
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
              ? accountAddress
              : undefined

          const contributorAddress =
            values.paymentDirection === PaymentDirection.AUTHOR_IS_RECIPIENT
              ? accountAddress
              : undefined

          try {
            await createRfpMutation({
              title: values.title,
              body: values.body,
              associatedAccountAddress: accountAddress,
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
              // social connections currently single choice but will become multiple choice once more integrations are added
              requiredSocialConnections: !!values.socialConnection ? [values.socialConnection] : [],
              minWordCount:
                values.wordCountRequirement === ProposalTemplateFieldValidationName.MIN_WORDS
                  ? parseInt(values.minWordCount)
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
                    {proposalStep === RfpFormStep.RFP && <RfpFormStepRfp formState={formState} />}
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
                      />
                    )}
                    {proposalStep === RfpFormStep.PERMISSIONS && (
                      <RfpFormStepPermission
                        permissionTokenOptions={permissionTokenOptions}
                        selectedSubmissionToken={selectedSubmissionToken}
                        setSelectedSubmissionToken={setSelectedSubmissionToken}
                        isImportTokenModalOpen={isImportTokenModalOpen}
                        setIsImportTokenModalOpen={setIsImportTokenModalOpen}
                        chainId={(chain?.id as number) || 1}
                        refetchTokens={refetchTokens}
                        wordCountRequirement={wordCountRequirement}
                        setWordCountRequirement={setWordCountRequirement}
                      />
                    )}
                  </>
                )}
              </div>
              {proposalStep === RfpFormStep.RFP && (
                <div className="my-6 float-right flex flex-col space-y-1 items-end">
                  <Button
                    isDisabled={missingFieldsGeneral || !userCanPostRfpForAccount}
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
                  {!userCanPostRfpForAccount && (
                    <span className="text-xs text-concrete">
                      Must connect a wallet with permission over this account.
                    </span>
                  )}
                </div>
              )}
              {proposalStep === RfpFormStep.PAYMENT && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(RfpFormStep.RFP)}
                    className="cursor-pointer border rounded border-marble-white p-2 self-start"
                  >
                    <BackArrow className="fill-marble-white" />
                  </span>
                  <div className="flex flex-col space-y-1 items-end">
                    <Button
                      isDisabled={missingFieldsPayment || !userCanPostRfpForAccount}
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
                    {!userCanPostRfpForAccount && (
                      <span className="text-xs text-concrete">
                        Must connect a wallet with permission over this account.
                      </span>
                    )}
                  </div>
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
                  <div className="flex flex-col space-y-1 items-end">
                    <Button
                      isDisabled={
                        isLoading || missingFieldsPermissions || !userCanPostRfpForAccount
                      }
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
                    {!userCanPostRfpForAccount && (
                      <span className="text-xs text-concrete">
                        Must connect a wallet with permission over this account.
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

export default RfpForm
