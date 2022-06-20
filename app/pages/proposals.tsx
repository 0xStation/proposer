import { useState } from "react"
import { BlitzPage } from "blitz"
import { Field, Form } from "react-final-form"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import truncateString from "app/core/utils/truncateString"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import Preview from "app/core/components/MarkdownPreview"
import Modal from "app/core/components/Modal"

const CreateProposalPage: BlitzPage = () => {
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false)
  const [markdown, setMarkdown] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const activeUser = useStore((state) => state.activeUser)

  // // redirect?
  // if (!terminal || !activeUser) {
  //   return <Layout title={`New RFP`}></Layout>
  // }

  return (
    <Layout title={`New Proposal`}>
      <div className="fixed grid grid-cols-4 w-[calc(100%-70px)] border-box z-50">
        <div className="col-span-3 pt-4 pr-4">
          <div
            className="text-light-concrete flex flex-row justify-end items-center space-x-2 cursor-pointer w-full"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <img src="/pencil.svg" />
                <span>Back to editing</span>
              </>
            ) : (
              <>
                <img src="/eye.svg" />
                <span>Preview</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 h-screen w-full box-border">
        <div className="overflow-y-auto col-span-3 p-20 relative">
          <div className="flex flex-row items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-concrete" />
            <span className="text-xs uppercase tracking-wider">Draft</span>
          </div>
          <div className="mt-6 flex flex-row">
            <input
              onChange={(e) => setTitle(e.target.value)}
              className="bg-tunnel-black text-3xl ml-2 w-full outline-none"
              placeholder="Give your idea a title..."
            />
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
              <textarea
                value={markdown}
                className="bg-tunnel-black w-full h-full outline-none resize-none"
                onChange={(e) => setMarkdown(e.target.value.length > 0 ? e.target.value : "")}
                placeholder="enter some text..."
              />
            ) : (
              <Preview markdown={markdown} />
            )}
          </div>
        </div>
        <div className="h-full border-l border-concrete col-span-1 flex flex-col">
          <Form
            onSubmit={async (values: {
              startDate: string
              endDate: string
              checkbookAddress: string
            }) => {
              console.log("trying to submit")
            }}
            render={({ form, handleSubmit }) => {
              const formState = form.getState()
              return (
                <form className="p-4 grow flex flex-col justify-between">
                  <Modal open={confirmationModalOpen} toggle={setConfirmationModalOpen}>
                    <div className="p-2">
                      <h3 className="text-2xl font-bold pt-6">Publishing RFP?</h3>
                      <p className="mt-2">
                        Contributors will be able to submit proposals to this RFP after the defined
                        start date. You can edit proposals anytime.
                      </p>
                      <div className="mt-8">
                        <button
                          type="button"
                          className="text-magic-mint border border-magic-mint mr-2 py-1 px-4 rounded hover:opacity-75"
                          onClick={() => setConfirmationModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-magic-mint text-tunnel-black border border-magic-mint py-1 px-4 rounded hover:opacity-75"
                          onClick={() => handleSubmit()}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </Modal>

                  <div>
                    <h4 className="text-xs font-bold text-concrete uppercase">
                      Proposal Recipient
                    </h4>
                    <p className="mt-2">0xmcg.eth</p>
                    <h4 className="text-xs font-bold text-concrete uppercase mt-4">
                      Request for Proposal
                    </h4>
                    <p className="mt-2 text-magic-mint">Education</p>
                    <label className="font-bold block mt-6">Fund Recipient*</label>
                    <span className="text-xs text-concrete block">
                      Primary destination of the funds. Project lead/creator’s wallet address is
                      recommended.
                    </span>

                    <Field name={`fundRecipient`}>
                      {({ input }) => (
                        <input
                          {...input}
                          type="text"
                          placeholder="Enter wallet or ENS address"
                          className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                        />
                      )}
                    </Field>

                    <Field name={`token`}>
                      {({ input }) => (
                        <>
                          <label className="font-bold block mt-6">Token*</label>
                          <div className="custom-select-wrapper">
                            <select
                              {...input}
                              className={`w-full bg-wet-concrete border border-concrete rounded p-2 mt-1`}
                            >
                              <option value="">Choose option</option>
                              <option value="USDC">USDC</option>
                              <option value="ETH">ETH</option>
                            </select>
                          </div>
                        </>
                      )}
                    </Field>

                    <Field name={`totalAmount`}>
                      {({ input }) => (
                        <>
                          <label className="font-bold block mt-6">Total Amount*</label>
                          <input
                            {...input}
                            type="text"
                            placeholder="Enter wallet or ENS address"
                            className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                          />
                        </>
                      )}
                    </Field>

                    <Field name="startDate">
                      {({ input, meta }) => (
                        <>
                          <label className="font-bold block mt-6">Start Date</label>
                          <span className="text-xs text-concrete block">
                            Proposal submission opens
                          </span>
                          <input
                            {...input}
                            type="date"
                            className="bg-wet-concrete border border-concrete rounded p-2 mt-1 w-full"
                          />
                        </>
                      )}
                    </Field>

                    <Field name="endDate">
                      {({ input, meta }) => (
                        <>
                          <label className="font-bold block mt-6">End Date</label>
                          <span className="text-xs text-concrete block">
                            Proposal submission closes
                          </span>
                          <input
                            {...input}
                            type="date"
                            className="bg-wet-concrete border border-concrete rounded p-2 mt-1 w-full"
                          />
                        </>
                      )}
                    </Field>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (formState.dirty) {
                          setConfirmationModalOpen(true)
                        }
                      }}
                      className={`mt-4 bg-magic-mint text-tunnel-black px-6 py-1 rounded block mx-auto ${
                        formState.dirty ? "hover:bg-opacity-70" : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      Publish
                    </button>
                  </div>
                </form>
              )
            }}
          />
        </div>
      </div>
    </Layout>
  )
}

CreateProposalPage.suppressFirstRenderFlicker = true
export default CreateProposalPage
