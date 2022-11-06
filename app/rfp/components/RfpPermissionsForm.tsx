import { useSession } from "@blitzjs/auth"
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import { TokenType } from "@prisma/client"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import ImportTokenModal from "app/core/components/ImportTokenModal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import useStore from "app/core/hooks/useStore"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { getNetworkName } from "app/core/utils/networkInfo"
import getTokensByAccount from "app/token/queries/getTokensByAccount"
import { formatPositiveInt, formatTokenAmount } from "app/utils/formatters"
import React, { useState } from "react"
import { Field, Form } from "react-final-form"
import { useNetwork } from "wagmi"
import {
  composeValidators,
  isPositiveAmount,
  isValidTokenAmount,
  requiredField,
} from "../../utils/validators"
import updateRfpRequiredToken from "../mutations/updateRfpRequiredToken"
import getRfpById from "../queries/getRfpById"

export const RfpPermissionsForm = ({ rfp }) => {
  const setToastState = useStore((state) => state.setToastState)
  const session = useSession({ suspense: false })
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)

  // payment directoin in parent form state because it gets reset when flipping through steps
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState<boolean>(false)
  const [selectedSubmissionToken, setSelectedSubmissionToken] = useState<any>(
    rfp?.data?.singleTokenGate?.token
  )

  const { chain } = useNetwork()

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(rfp?.accountAddress) },
    {
      enabled: !!rfp?.accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  const [permissionTokenOptions, { refetch: refetchTokens }] = useQuery(
    getTokensByAccount,
    {
      chainId: chain?.id || 1,
      userId: account?.id, // get tokens by account id so that different authors for the same workspace can share previously made tokens for the workspace
    },
    {
      suspense: false,
      enabled: Boolean(chain?.id && account?.id),
      staleTime: 30 * 1000,
      onSuccess: (tokens) => {
        setSelectedSubmissionToken(
          tokens.find((token) => token.address === rfp?.data?.singleTokenGate?.token?.address)
        )
      },
    }
  )

  const [updateRfpRequiredTokenMutation] = useMutation(updateRfpRequiredToken, {
    onSuccess: async (data) => {
      invalidateQuery(getRfpById)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "RFP successfully updated. ",
      })
    },
    onError: (error) => {
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error updating RFP.",
      })
    },
  })
  return (
    <>
      <ImportTokenModal
        isOpen={isImportTokenModalOpen}
        setIsOpen={setIsImportTokenModalOpen}
        chainId={chain?.id?.toString()}
        // refetches the tokens in the new proposal form token dropdown
        callback={() => refetchTokens()}
      />
      <Form
        initialValues={{
          submissionTokenAddress: rfp?.data?.singleTokenGate?.token.address,
          submissionTokenMinBalance: rfp?.data?.singleTokenGate?.minBalance,
        }}
        onSubmit={async (values: any, form) => {
          try {
            await updateRfpRequiredTokenMutation({
              rfpId: rfp?.id,
              singleTokenGate: !!selectedSubmissionToken
                ? { token: selectedSubmissionToken, minBalance: values.submissionTokenMinBalance }
                : undefined,
            })
          } catch (err) {
            console.error(err)
          }
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()

          return (
            <form onSubmit={handleSubmit}>
              {/* SUBMISSION TOKEN */}
              <label className="font-bold block mt-6">Token-gate submissions</label>
              <span className="text-xs text-concrete block">
                Select from ERC-20 or ERC-721 tokens on the{" "}
                <span className="font-bold">
                  {getNetworkName(chain?.id as number).toUpperCase()}
                </span>{" "}
                network.
              </span>
              <Field name="submissionTokenAddress">
                {({ input, meta }) => {
                  return (
                    <>
                      <div className="custom-select-wrapper">
                        <select
                          // if network is selected make the token address field required.
                          // required
                          {...input}
                          className="w-full bg-wet-concrete rounded p-2 mt-1"
                          value={selectedSubmissionToken?.address as string}
                          onChange={(e) => {
                            const selectedSubmissionToken = permissionTokenOptions?.find((token) =>
                              addressesAreEqual(token.address, e.target.value)
                            )
                            setSelectedSubmissionToken(selectedSubmissionToken)
                            // custom values can be compatible with react-final-form by calling
                            // the props.input.onChange callback
                            // https://final-form.org/docs/react-final-form/api/Field
                            input.onChange(selectedSubmissionToken?.address)
                          }}
                        >
                          <option value="">None</option>
                          {permissionTokenOptions?.map((token) => {
                            return (
                              <option key={token?.address} value={token?.address}>
                                {`${token?.symbol} - ${token?.name} (${token?.type})`}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                      {meta.touched && meta.error && (
                        <span className="text-torch-red text-xs">{meta.error}</span>
                      )}
                    </>
                  )
                }}
              </Field>
              <div className="flex flex-row justify-end">
                <button
                  className="text-electric-violet cursor-pointer flex justify-start"
                  onClick={(e) => {
                    e.preventDefault()
                    return !session.siwe?.address
                      ? toggleWalletModal(true)
                      : setIsImportTokenModalOpen(true)
                  }}
                >
                  + Import
                </button>
              </div>
              {!!selectedSubmissionToken && (
                <>
                  {/* MINIMUM BALANCE */}
                  <label className="font-bold block mt-6">Minimum balance*</label>
                  <WhenFieldChanges
                    // when changing tokens, reset minimum balance value
                    field="submissionTokenAddress"
                    set="submissionTokenMinBalance"
                    to={""}
                  />
                  <Field
                    name="submissionTokenMinBalance"
                    format={
                      selectedSubmissionToken.type === TokenType.ERC721
                        ? formatPositiveInt // 721 has no decimals so all balances are integers
                        : formatTokenAmount // other token amounts support decimals
                    }
                    validate={composeValidators(
                      requiredField,
                      isValidTokenAmount(selectedSubmissionToken?.decimals || 0),
                      isPositiveAmount
                    )}
                  >
                    {({ input, meta }) => {
                      return (
                        <div className="h-10 mt-1 w-full bg-wet-concrete text-marble-white mb-5 rounded">
                          <input
                            {...input}
                            type="text"
                            placeholder="0"
                            className="h-full p-2 inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                          />
                          {meta.error && meta.touched && (
                            <span className="text-xs text-torch-red mt-2 block">{meta.error}</span>
                          )}
                        </div>
                      )
                    }}
                  </Field>
                </>
              )}
              <Button
                type={ButtonType.Secondary}
                isSubmitType={true}
                isDisabled={!formState.valid || formState.pristine}
                className="mt-7"
              >
                Save
              </Button>
            </form>
          )
        }}
      />
    </>
  )
}
