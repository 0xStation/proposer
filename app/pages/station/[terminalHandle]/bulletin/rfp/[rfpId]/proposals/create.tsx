import { useState } from "react"
import {
  BlitzPage,
  invoke,
  GetServerSideProps,
  InferGetServerSidePropsType,
  Routes,
  Link,
  useRouter,
  useParam,
  useMutation,
} from "blitz"
import { Field, Form } from "react-final-form"
import { LightBulbIcon, XIcon } from "@heroicons/react/solid"
import { parseUnits } from "@ethersproject/units"
import { useBalance } from "wagmi"
// components
import Layout from "app/core/layouts/Layout"
import Preview from "app/core/components/MarkdownPreview"
import Modal from "app/core/components/Modal"
import CheckbookSelectToken from "app/core/components/CheckbookSelectToken"
import MarkdownShortcuts from "app/core/components/MarkdownShortcuts"
// hooks
import useStore from "app/core/hooks/useStore"
import useWarnIfUnsavedChanges from "app/core/hooks/useWarnIfUnsavedChanges"
import useCheckbookAvailability from "app/core/hooks/useCheckbookAvailability"
import useSignature from "app/core/hooks/useSignature"
// queries + mutations
import getRfpById from "app/rfp/queries/getRfpById"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import createProposal from "app/proposal/mutations/createProposal"
// utils
import truncateString from "app/core/utils/truncateString"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import { requiredField, isPositiveAmount, composeValidators, isAddress } from "app/utils/validators"
import { fetchTokenDecimals } from "app/utils/fetchTokenDecimals"
import { ZERO_ADDRESS } from "app/core/utils/constants"
import { genProposalSignatureMessage } from "app/signatures/proposal"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
//types
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"

type GetServerSidePropsData = {
  rfp: Rfp
  terminal: Terminal
}

const CreateProposalPage: BlitzPage = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false)
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false)
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(true)
  const router = useRouter()
  const fundingToken = data.rfp.data.funding.token

  useWarnIfUnsavedChanges(unsavedChanges, () => {
    return confirm("Warning! You have unsaved changes.")
  })

  const checkbookTokens = useCheckbookAvailability(data.rfp.checkbook, data.terminal)

  const amountMessage = (amount) => {
    const selectedToken = checkbookTokens.find((token) =>
      addressesAreEqual(token.address, fundingToken.address)
    )
    if (!selectedToken) {
      return
    }
    if (parseFloat(fundingToken.available) < amount) {
      return `The RFP's checkbook only has ${selectedToken.available} ${selectedToken.symbol}. You can request ${amount}, but it cannot be approved until an admin adds more ${selectedToken.symbol} to the checkbook.`
    }
  }

  const terminalHandle = useParam("terminalHandle") as string
  const [createProposalMutation] = useMutation(createProposal, {
    onSuccess: async (response) => {
      try {
        // send new proposal notification
        await fetch("/api/notify/proposal/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proposalId: response.id,
          }),
        })
      } catch (e) {
        console.error(e)
      }

      router.push(
        Routes.ProposalsTab({
          terminalHandle: terminalHandle,
          rfpId: data.rfp.id,
          proposalId: response.id,
        })
      )
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  let { signMessage } = useSignature()

  return (
    <Layout title={`New Proposal`}>
      <div className="fixed grid grid-cols-4 w-[calc(100%-70px)] border-box z-50">
        <div className="col-span-3 pt-4 pr-4">
          <div className="text-light-concrete flex flex-row justify-between w-full">
            <button
              onClick={() => {
                router.push(
                  Routes.RFPInfoTab({
                    terminalHandle: terminalHandle,
                    rfpId: data.rfp?.id as string,
                  })
                )
              }}
            >
              <XIcon className="h-6 w-6 ml-3 fill-marble-white" />
            </button>
            <div className="flex flex-row items-center space-x-4">
              <button
                className={`${
                  shortcutsOpen && "font-bold text-marble-white bg-wet-concrete"
                } cursor-pointer h-[35px] rounded px-2`}
                onClick={() => {
                  setShortcutsOpen(!shortcutsOpen)
                }}
              >
                Markdown shortcuts
              </button>
              <div
                className="space-x-2 items-center flex cursor-pointer"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <>
                    <img src="/pencil.svg" className="inline pr-2 self-center" />
                    <span>Back to editing</span>
                  </>
                ) : (
                  <>
                    <img src="/eye.svg" className="inline pr-2 items-center" />
                    <span>Preview</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Form
        initialValues={{
          markdown: data.rfp.data.proposalPrefill,
        }}
        onSubmit={async (values: {
          recipientAddress: string
          amount: string
          markdown: string
          title: string
        }) => {
          if (!activeUser?.address) {
            setToastState({
              isToastShowing: true,
              type: "error",
              message: "You must connect your wallet in order to create a proposal",
            })
          } else {
            const parsedTokenAmount = parseUnits(values.amount, fundingToken.decimals)

            const message = genProposalSignatureMessage(
              data.rfp.checkbook.address,
              activeUser?.address,
              data.rfp.id,
              parsedTokenAmount,
              { ...values, token: fundingToken.address }
            )

            const signature = await signMessage(message)

            // user must have denied signature
            if (!signature) {
              return
            }

            try {
              await createProposalMutation({
                rfpId: data.rfp.id,
                terminalId: data.terminal.id,
                recipientAddress: values.recipientAddress,
                token: fundingToken.address,
                amount: values.amount,
                symbol: fundingToken.symbol,
                contentBody: values.markdown,
                contentTitle: values.title,
                collaborators: [activeUser.address],
                signature,
                signatureMessage: message,
              })
            } catch (e) {
              console.error(e)
              setToastState({
                isToastShowing: true,
                type: "error",
                message: "Something went wrong.",
              })
            }
          }
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <div className="grid grid-cols-4 h-screen w-full box-border">
              <div className="overflow-y-auto col-span-3 p-20 relative">
                <div className="flex flex-row space-x-4">
                  <span className=" bg-wet-concrete rounded-full px-2 py-1 flex items-center space-x-1">
                    <LightBulbIcon className="h-4 w-4 text-marble-white" />
                    <span className="text-xs uppercase">Proposal</span>
                  </span>
                  <div className="flex flex-row items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-concrete" />
                    <span className="text-xs uppercase tracking-wider font-bold">DRAFT</span>
                  </div>
                </div>
                <div className="mt-6 flex flex-row">
                  <Field name={`title`} validate={requiredField}>
                    {({ input }) => (
                      <input
                        {...input}
                        type="text"
                        placeholder="Give your idea a title..."
                        className="bg-tunnel-black text-3xl font-bold w-full outline-none"
                      />
                    )}
                  </Field>
                </div>
                <div className="mt-6 grid grid-cols-5 gap-4">
                  <div className="flex flex-row items-center">
                    {activeUser?.data.pfpURL ? (
                      <img
                        src={activeUser?.data.pfpURL}
                        alt="PFP"
                        className="w-[46px] h-[46px] rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PFP_URLS.USER
                        }}
                      />
                    ) : (
                      <div className="h-[46px] min-w-[46px] max-w-[46px] place-self-center border border-wet-concrete bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
                    )}
                    <div className="ml-2">
                      <span>{activeUser?.data.name}</span>
                      <span className="text-xs text-light-concrete flex">
                        @{truncateString(activeUser?.address, 4)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-12 h-full">
                  {!previewMode ? (
                    <Field name={`markdown`} validate={requiredField}>
                      {({ input }) => (
                        <textarea
                          {...input}
                          placeholder={`How are you looking to help ${data.rfp.terminal.data.name}?`}
                          className="bg-tunnel-black w-full h-full outline-none resize-none"
                        />
                      )}
                    </Field>
                  ) : (
                    <Preview markdown={formState.values.markdown} />
                  )}
                </div>

                <MarkdownShortcuts isOpen={shortcutsOpen} />
              </div>
              <div className="h-full border-l border-concrete col-span-1 flex flex-col">
                <form className="p-4 grow flex flex-col justify-between">
                  <Modal open={confirmationModalOpen} toggle={setConfirmationModalOpen}>
                    <div className="p-2">
                      <h3 className="text-2xl font-bold pt-6">Publishing proposal?</h3>
                      <p className="mt-2">You won’t be able to edit the proposal.</p>
                      <div className="mt-8">
                        <button
                          type="button"
                          className="text-electric-violet border border-electric-violet mr-2 py-1 px-4 rounded hover:opacity-75"
                          onClick={() => setConfirmationModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75"
                          onClick={() => handleSubmit()}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </Modal>

                  <div>
                    <h4 className="text-xs font-bold text-concrete uppercase">Station</h4>
                    <div className="flex flex-row items-center mt-2">
                      {data.rfp.terminal.data.pfpURL ? (
                        <img
                          src={data.rfp.terminal.data.pfpURL}
                          alt="PFP"
                          className="w-[46px] h-[46px] rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
                          }}
                        />
                      ) : (
                        <span className="w-[46px] h-[46px] bg-gradient-to-b  from-neon-blue to-torch-red block rounded-lg" />
                      )}
                      <div className="ml-2">
                        <span>{data.rfp.terminal.data.name}</span>
                        <span className="text-xs text-light-concrete flex">
                          @{data.rfp.terminal.handle}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-concrete uppercase mt-6">
                      Request for Proposal
                    </h4>
                    <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: data.rfp.id })} passHref>
                      <a target="_blank" rel="noopener noreferrer">
                        <p className="mt-2 text-electric-violet cursor-pointer">
                          {data.rfp.data.content.title}
                        </p>
                      </a>
                    </Link>
                    <label className="font-bold block mt-6">Fund recipient*</label>
                    <span className="text-xs text-concrete block">
                      Primary destination of the funds. Project lead/creator’s wallet address is
                      recommended.
                    </span>
                    <Field
                      name="recipientAddress"
                      validate={composeValidators(requiredField, isAddress)}
                    >
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

                    <Field
                      name={`amount`}
                      validate={composeValidators(requiredField, isPositiveAmount)}
                    >
                      {({ meta, input }) => (
                        <>
                          <label className="font-bold block mt-6">Total amount*</label>
                          <input
                            {...input}
                            type="text"
                            placeholder="Enter token amount"
                            className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                          />
                          {formState.values.amount && (
                            <span className="text-neon-carrot text-xs block mt-2">
                              {amountMessage(formState.values.amount)}
                            </span>
                          )}
                          {(meta.touched || attemptedSubmit) && meta.error && (
                            <span className="text-torch-red text-xs">{meta.error}</span>
                          )}
                        </>
                      )}
                    </Field>

                    <div className="mt-6">
                      <p className="text-concrete uppercase text-xs font-bold">Token</p>
                      <p className="mt-2 uppercase">{data.rfp.data.funding.token.symbol}</p>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttemptedSubmit(true)
                        if (formState.invalid) {
                          const fieldsWithErrors = Object.keys(formState.errors as Object)
                          setToastState({
                            isToastShowing: true,
                            type: "error",
                            message: `Please fill in ${fieldsWithErrors.join(
                              ", "
                            )} to publish RFP.`,
                          })
                          return
                        }
                        setUnsavedChanges(false)
                        setConfirmationModalOpen(true)
                      }}
                      className={`bg-electric-violet text-tunnel-black px-6 py-1 rounded block mx-auto hover:bg-opacity-70`}
                    >
                      Publish
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }}
      />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { terminalHandle, rfpId } = context.query as { terminalHandle: string; rfpId: string }
  const rfp = await invoke(getRfpById, { id: rfpId })
  const terminal = await invoke(getTerminalByHandle, { handle: terminalHandle })

  if (!rfp || !terminal) {
    return {
      notFound: true,
    }
  }

  const data: GetServerSidePropsData = {
    rfp,
    terminal,
  }

  return {
    props: { data },
  }
}

CreateProposalPage.suppressFirstRenderFlicker = true
export default CreateProposalPage
