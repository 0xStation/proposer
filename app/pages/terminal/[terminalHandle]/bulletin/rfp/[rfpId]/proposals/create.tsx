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
import { XIcon } from "@heroicons/react/solid"
// components
import Layout from "app/core/layouts/Layout"
import Preview from "app/core/components/MarkdownPreview"
import Modal from "app/core/components/Modal"
import CheckbookSelectToken from "app/core/components/CheckbookSelectToken"
// hooks
import useStore from "app/core/hooks/useStore"
// queries + mutations
import getRfpById from "app/rfp/queries/getRfpById"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import createProposal from "app/proposal/mutations/createProposal"
// utils
import truncateString from "app/core/utils/truncateString"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import { requiredField } from "app/utils/validators"
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
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const router = useRouter()

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

      <Form
        initialValues={{
          markdown: data.rfp.data.proposalPrefill,
        }}
        onSubmit={async (values: {
          recipientAddress: string
          token: string
          amount: number
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
            try {
              await createProposalMutation({
                rfpId: data.rfp.id,
                terminalId: data.terminal.id,
                recipientAddress: values.recipientAddress,
                token: values.token,
                amount: values.amount,
                contentBody: values.markdown,
                contentTitle: values.title,
                collaborators: [activeUser.address],
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
                <div className="flex flex-row items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-concrete" />
                  <span className="text-xs uppercase tracking-wider">Draft</span>
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
                    <img
                      src={activeUser?.data.pfpURL}
                      alt="PFP"
                      className="w-[46px] h-[46px] rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PFP_URLS.USER
                      }}
                    />
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
                          placeholder="enter some text..."
                          className="bg-tunnel-black w-full h-full outline-none resize-none"
                        />
                      )}
                    </Field>
                  ) : (
                    <Preview markdown={formState.values.markdown} />
                  )}
                </div>
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
                    <h4 className="text-xs font-bold text-concrete uppercase">Terminal</h4>
                    <div className="flex flex-row items-center mt-2">
                      <img
                        src={data.rfp.terminal.data.pfpURL}
                        alt="PFP"
                        className="w-[46px] h-[46px] rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
                        }}
                      />
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

                    <Field name="recipientAddress" validate={requiredField}>
                      {({ meta, input }) => (
                        <>
                          <input
                            {...input}
                            type="text"
                            required
                            placeholder="Enter wallet or ENS address"
                            className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                          />

                          {((meta.touched && input.value === "") || meta.error) && (
                            <span className="text-torch-red text-xs">
                              You must provide an address.
                            </span>
                          )}
                        </>
                      )}
                    </Field>

                    <Field name={`token`} validate={requiredField}>
                      {({ meta, input }) => (
                        <>
                          <label className="font-bold block mt-6">Token*</label>
                          <div className="custom-select-wrapper">
                            <CheckbookSelectToken
                              terminal={data.terminal}
                              checkbook={data.rfp.checkbook}
                              options={input}
                            />
                          </div>
                          {((meta.touched && input.value === "") || meta.error) && (
                            <span className="text-torch-red text-xs">You must select a token.</span>
                          )}
                        </>
                      )}
                    </Field>

                    <Field name={`amount`} validate={requiredField}>
                      {({ meta, input }) => (
                        <>
                          <label className="font-bold block mt-6">Total amount*</label>
                          <input
                            {...input}
                            type="text"
                            placeholder="Enter token amount"
                            className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                          />
                          {((meta.touched && input.value === "") || meta.error) && (
                            <span className="text-torch-red text-xs">
                              You must provide an amount.
                            </span>
                          )}
                        </>
                      )}
                    </Field>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
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
