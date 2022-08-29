/**
 * THIS IS CONNERS PLAY SPACE FOR TESTING
 * DO NOT TOUCH
 */

import { BlitzPage, Link, Routes, useMutation } from "blitz"
import { useEffect, useState } from "react"
import Layout from "app/core/layouts/Layout"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { parseUniqueAddresses } from "app/core/utils/parseUniqueAddresses"
import { SUPPORTED_CHAINS, ETH_METADATA } from "app/core/utils/constants"
import networks from "app/utils/networks.json"
import createProposal from "app/proposalNew/mutations/createProposalNew"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

const ConnerProposal: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(1)
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<any>()
  const [tokenOptions, setTokenOptions] = useState<any[]>()

  useEffect(() => {
    if (selectedNetworkId) {
      const stablecoins = networks[selectedNetworkId]?.stablecoins || []
      setTokenOptions([ETH_METADATA, ...stablecoins])
      setSelectedToken("")
    }
  }, [selectedNetworkId])

  const [createProposalMutation] = useMutation(createProposal, {
    onSuccess: (_data) => {
      console.log("proposal created", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <Layout title="New Proposal">
      <section className="flex-1 ml-10">
        <h2 className="text-marble-white text-2xl font-bold mt-10">New Proposal</h2>
        <Form
          onSubmit={async (values: any, form) => {
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
          render={({ form, handleSubmit }) => {
            const formState = form.getState()
            const disableSubmit = true
            return (
              <form onSubmit={handleSubmit}>
                <div className="w-1/3 flex flex-col col-span-2 mt-6">
                  {/* TITLE */}
                  <label className="font-bold block mt-6">Title</label>
                  <span className="text-xs text-concrete block">Only a few words please</span>
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
                  <label className="font-bold block mt-6">Body</label>
                  <span className="text-xs text-concrete block">More space for ya</span>
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
                  <label className="font-bold block mt-6">Contributor</label>
                  <span className="text-xs text-concrete block">
                    Paste the address of who is doing work
                  </span>
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
                  <label className="font-bold block mt-6">Client</label>
                  <span className="text-xs text-concrete block">
                    Paste address of who is paying for work
                  </span>
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
                  <label className="font-bold block mt-6">Network*</label>
                  <span className="text-xs text-concrete block">Which network to transact on</span>
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
                            <option value="">Choose option</option>
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
                  <div className="flex flex-col mt-6">
                    <label className="font-bold block">Reward token*</label>
                    <span className="text-xs text-concrete block">Which token to be paid with</span>
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
                  </div>
                  {/* PAYMENT AMOUNT */}
                  <label className="font-bold block mt-6">Payment Amount</label>
                  <span className="text-xs text-concrete block">How many tokens to be paid</span>
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
                  <Button className="my-16" isSubmitType={true}>
                    Submit
                  </Button>
                </div>
              </form>
            )
          }}
        />
      </section>
    </Layout>
  )
}

ConnerProposal.suppressFirstRenderFlicker = true

export default ConnerProposal
