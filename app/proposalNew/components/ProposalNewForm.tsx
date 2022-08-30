import { BlitzPage, Link, Routes, useRouter, useMutation } from "blitz"
import { useEffect, useState } from "react"
import Layout from "app/core/layouts/Layout"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { SUPPORTED_CHAINS, ETH_METADATA } from "app/core/utils/constants"
import networks from "app/utils/networks.json"
import createProposal from "app/proposalNew/mutations/createProposalNew"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import FormFieldLabel from "app/core/components/FormFieldLabel"

export const ProposalNewForm = () => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(0)
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<any>()
  const [tokenOptions, setTokenOptions] = useState<any[]>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (selectedNetworkId) {
      const stablecoins = networks[selectedNetworkId]?.stablecoins || []
      setTokenOptions([ETH_METADATA, ...stablecoins])
      setSelectedToken("")
    }
  }, [selectedNetworkId])

  const [createProposalMutation] = useMutation(createProposal, {
    onSuccess: (data) => {
      console.log("proposal created", data)
      router.push(
        Routes.ViewProposalNew({
          proposalId: data.id,
        })
      )
      setIsLoading(false)
    },
    onError: (error: Error) => {
      console.error(error)
      setIsLoading(false)
    },
  })

  return (
    <Form
      onSubmit={async (values: any, form) => {
        setIsLoading(true)

        const token = tokenOptions?.find((token) =>
          addressesAreEqual(token.address, values.tokenAddress)
        )

        if (!token) {
          throw Error("token not found")
        }

        createProposalMutation({
          contentTitle: values.title,
          contentBody: values.body,
          contributorAddress: values.contributor,
          clientAddress: values.client,
          authorAddresses: [activeUser!.address!],
          token: { ...token, chainId: selectedNetworkId },
          paymentAmount: values.paymentAmount,
        })
      }}
      render={({ handleSubmit }) => {
        return (
          <form onSubmit={handleSubmit}>
            <div className="w-1/3 flex flex-col col-span-2 mt-16 ml-16">
              {/* TITLE */}
              <FormFieldLabel
                className="mt-6"
                label="Title"
                description="Only a few words please"
              />
              <Field name="title">
                {({ meta, input }) => (
                  <>
                    <input
                      {...input}
                      type="text"
                      required
                      placeholder="I want money"
                      className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                    />

                    {meta.touched && meta.error && (
                      <span className="text-torch-red text-xs">{meta.error}</span>
                    )}
                  </>
                )}
              </Field>
              {/* BODY */}
              <FormFieldLabel className="mt-6" label="Body" description="More space for ya" />
              <Field name="body" component="textarea">
                {({ input, meta }) => (
                  <div>
                    <textarea
                      {...input}
                      placeholder="I want money because ..."
                      className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2 rounded min-h-[112px] w-full"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className=" text-xs text-torch-red block">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
              {/* CONTRIBUTOR */}
              <FormFieldLabel
                className="mt-6"
                label="Contributor"
                description="Paste the address of who is doing work"
              />
              <Field name="contributor">
                {({ meta, input }) => (
                  <>
                    <input
                      {...input}
                      type="text"
                      required
                      placeholder="Enter wallet or ENS address"
                      className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                    />

                    {(meta.touched || attemptedSubmit) && meta.error && (
                      <span className="text-torch-red text-xs">{meta.error}</span>
                    )}
                  </>
                )}
              </Field>
              {/* CLIENT */}
              <FormFieldLabel
                className="mt-6"
                label="Client"
                description="Paste the address of who is paying for work"
              />
              <Field name="client">
                {({ meta, input }) => (
                  <>
                    <input
                      {...input}
                      type="text"
                      required
                      placeholder="Enter wallet or ENS address"
                      className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                    />

                    {(meta.touched || attemptedSubmit) && meta.error && (
                      <span className="text-torch-red text-xs">{meta.error}</span>
                    )}
                  </>
                )}
              </Field>
              {/* NETWORK */}
              <FormFieldLabel
                className="mt-6"
                label="Network"
                description="Which network you will transact on"
              />
              <Field name="network">
                {({ input, meta }) => {
                  return (
                    <div className="custom-select-wrapper">
                      <select
                        {...input}
                        className="w-full bg-wet-concrete border border-concrete rounded p-1 mt-1"
                        value={selectedNetworkId as number}
                        onChange={(e) => {
                          const network = SUPPORTED_CHAINS.find(
                            (chain) => chain.id === parseInt(e.target.value)
                          )
                          setSelectedNetworkId(network?.id as number)
                          // custom values can be compatible with react-final-form by calling
                          // the props.input.onChange callback
                          // https://final-form.org/docs/react-final-form/api/Field
                          input.onChange(network?.id)
                        }}
                      >
                        <option value={0}>Choose option</option>
                        {SUPPORTED_CHAINS?.map((chain, idx) => {
                          return (
                            <option key={chain.id} value={chain.id}>
                              {chain.name}
                            </option>
                          )
                        })}
                      </select>
                      {(meta.touched || attemptedSubmit) && meta.error && (
                        <span className="text-torch-red text-xs">{meta.error}</span>
                      )}
                    </div>
                  )
                }}
              </Field>
              {/* TOKEN */}
              <FormFieldLabel
                className="mt-6"
                label="Payment token"
                description="Token used for payment"
              />
              <Field name="tokenAddress">
                {({ input, meta }) => {
                  return (
                    <div className="custom-select-wrapper">
                      <select
                        {...input}
                        className="w-full bg-wet-concrete border border-concrete rounded p-1 mt-1"
                        value={selectedToken?.address as string}
                      >
                        <option value="">Choose option</option>
                        {tokenOptions?.map((token) => {
                          return (
                            <option key={token.address} value={token.address}>
                              {token.symbol}
                            </option>
                          )
                        })}
                      </select>
                      {(meta.touched || attemptedSubmit) && meta.error && (
                        <span className="text-torch-red text-xs">{meta.error}</span>
                      )}
                    </div>
                  )
                }}
              </Field>
              {/* PAYMENT AMOUNT */}
              <FormFieldLabel
                className="mt-6"
                label="Payment amount"
                description="How many tokens will be paid"
              />
              <Field name="paymentAmount">
                {({ meta, input }) => (
                  <>
                    <input
                      {...input}
                      type="text"
                      required
                      placeholder="0.00"
                      className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                    />

                    {meta.touched && meta.error && (
                      <span className="text-torch-red text-xs">{meta.error}</span>
                    )}
                  </>
                )}
              </Field>
              {/* SUBMIT BUTTON */}
              <Button
                className="my-16"
                isSubmitType={true}
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Submit
              </Button>
            </div>
          </form>
        )
      }}
    />
  )
}

ProposalNewForm.suppressFirstRenderFlicker = true

export default ProposalNewForm
