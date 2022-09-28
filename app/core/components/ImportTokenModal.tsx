import { useMutation, useRouter, useSession } from "blitz"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import createAndConnectTokenToAccount from "app/token/mutations/createAndConnectTokenToAccount"
import { Field, Form } from "react-final-form"
import { SUPPORTED_CHAINS } from "../utils/constants"
import { useState } from "react"
import { TokenType } from "@prisma/client"
import { composeValidators, isAddress, requiredField } from "app/utils/validators"

export const ImportTokenModal = ({
  isOpen,
  setIsOpen,
  chainId = "",
  callback = () => {},
}: {
  isOpen: boolean
  setIsOpen: (open) => void
  chainId?: string
  callback?: () => void
}) => {
  const session = useSession({ suspense: false })
  const setToastState = useStore((state) => state.setToastState)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const [loading, setLoading] = useState<boolean>(false)
  const [createAndConnectTokenToAccountMutation] = useMutation(createAndConnectTokenToAccount, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Import a token</h3>
        <p className="mt-2">Import ERC-20s that you’d like to be rewarded in.</p>

        <div className="mt-6">
          <Form
            initialValues={{
              chainId,
            }}
            onSubmit={async (values) => {
              // user needs to be logged-in so we can save the
              // imported token to their account
              if (!session.userId) {
                toggleWalletModal(true)
              }

              setLoading(true)
              let tokenMetadata
              try {
                const metadataResponse = await fetch("/api/fetch-token-metadata", {
                  method: "POST",
                  headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    address: values?.tokenAddress,
                    chainId: parseInt(values.chainId),
                  }),
                })

                const tokenMetadataRes = await metadataResponse.json()

                if (tokenMetadataRes.response !== "success") {
                  setToastState({
                    isToastShowing: true,
                    type: "error",
                    message: tokenMetadataRes.message,
                  })
                  setLoading(false)
                  return
                }

                tokenMetadata = tokenMetadataRes?.data
                if (tokenMetadata?.type !== TokenType.ERC20) {
                  setLoading(false)
                  setToastState({
                    isToastShowing: true,
                    type: "error",
                    message: "Please import an ERC20 contract address",
                  })
                  setIsOpen(false)
                  return
                }
              } catch (e) {
                setLoading(false)
                console.error(e)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: e.message,
                })
              }

              try {
                const newTokens = await createAndConnectTokenToAccountMutation({
                  type: tokenMetadata.type as TokenType,
                  address: values?.tokenAddress,
                  chainId: parseInt(values.chainId),
                  name: tokenMetadata?.name,
                  symbol: tokenMetadata?.symbol,
                  decimals: tokenMetadata?.decimals,
                })
                if (newTokens) {
                  setToastState({
                    isToastShowing: true,
                    type: "success",
                    message: `Successfully imported your token ${tokenMetadata?.symbol}`,
                  })
                  callback()
                }

                setLoading(false)
                setIsOpen(false)
                return
              } catch (e) {
                setLoading(false)
                console.error(e)
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: e.message,
                })
                return
              }
            }}
            render={({ form, handleSubmit }) => {
              const formState = form.getState()
              return (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col">
                    {/* Network */}
                    <h3 className="font-bold">Network*</h3>
                    <Field
                      name="chainId"
                      component="select"
                      className="bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                      validate={composeValidators(requiredField)}
                    >
                      {({ input, meta }) => {
                        return (
                          <div className="custom-select-wrapper">
                            <select
                              {...input}
                              required
                              className="w-full bg-wet-concrete border border-concrete rounded p-1 mt-1"
                              onChange={(e) => {
                                const network = SUPPORTED_CHAINS.find(
                                  (chain) => chain.id === parseInt(e.target.value)
                                )
                                // custom values can be compatible with react-final-form by calling
                                // the props.input.onChange callback
                                // https://final-form.org/docs/react-final-form/api/Field
                                input.onChange(network?.id)
                              }}
                            >
                              <option value="">Choose option</option>
                              {SUPPORTED_CHAINS?.map((chain, idx) => {
                                return (
                                  <option key={chain.id} value={chain.id}>
                                    {chain.name}
                                  </option>
                                )
                              })}
                            </select>
                            {meta.touched && meta.error && (
                              <span className="text-torch-red text-xs mt-1">{meta.error}</span>
                            )}
                          </div>
                        )
                      }}
                    </Field>
                    {/* Contract address */}
                    <h3 className="font-bold mt-4">Contract address*</h3>
                    <Field
                      name="tokenAddress"
                      validate={composeValidators(requiredField, isAddress)}
                    >
                      {({ meta, input }) => (
                        <>
                          <input
                            {...input}
                            type="text"
                            required
                            placeholder="0x..."
                            className="bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                          />

                          {meta.touched && meta.error && (
                            <span className="text-torch-red text-xs mt-1">{meta.error}</span>
                          )}
                        </>
                      )}
                    </Field>
                    <div className="mt-9 flex justify-end">
                      <Button
                        type={ButtonType.Secondary}
                        className="mr-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        isDisabled={Boolean(Object.keys((formState?.errors as any) || {}).length)}
                        isSubmitType={true}
                        isLoading={loading}
                      >
                        Import
                      </Button>
                    </div>
                  </div>
                </form>
              )
            }}
          />
        </div>
      </div>
    </Modal>
  )
}

export default ImportTokenModal
