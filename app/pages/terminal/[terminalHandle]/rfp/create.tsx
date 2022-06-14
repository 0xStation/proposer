import { useState } from "react"
import { BlitzPage, useMutation, useQuery, useParam, Link, Routes } from "blitz"
import { Field, Form } from "react-final-form"
import { LockClosedIcon } from "@heroicons/react/solid"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import truncateString from "app/core/utils/truncateString"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import Preview from "app/core/components/MarkdownPreview"
import createRfp from "app/rfp/mutations/createRfp"
import getCheckbooksByTerminal from "app/checkbook/queries/getCheckbooksByTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Modal from "app/core/components/Modal"

const CreateRFPPage: BlitzPage = () => {
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [markdown, setMarkdown] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle }
  )

  const [checkbooks] = useQuery(
    getCheckbooksByTerminal,
    { terminalId: terminal?.id || 0 }, // does anyone know how to get rid of typescript errors here?
    { suspense: false, enabled: !!terminal } // it wont run unless terminal exists, but TS doesnt pick up on that
  )

  const [createRfpMutation] = useMutation(createRfp)

  // redirect?
  if (!terminal || !activeUser) {
    return <Layout title={`New RFP`}></Layout>
  }

  return (
    <Layout title={`New RFP`}>
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
            <span className="text-3xl font-bold">RFP:</span>
            <input
              onChange={(e) => setTitle(e.target.value)}
              className="bg-tunnel-black text-3xl ml-2 w-full outline-none"
              placeholder="Give your request a title..."
            />
          </div>
          <div className="mt-6 flex flex-row">
            <img
              src={activeUser?.data.pfpURL}
              alt="PFP"
              className={"w-[46px] h-[46px] rounded-full"}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.USER
              }}
            />
            <div className="ml-2">
              <span>{activeUser?.data.name}</span>
              <span className="text-xs text-light-concrete flex mt-1">
                @{truncateString(activeUser?.address, 4)}
              </span>
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
          <div className="border-b border-concrete p-4 flex flex-row space-x-8">
            <span className="font-bold">General</span>
            <div className="flex flex-row space-x-1 items-center">
              <LockClosedIcon className="h-4 w-4 hover:stroke-light-concrete text-concrete cursor-pointer" />
              <span className="text-concrete">Permission</span>
            </div>
          </div>
          <Form
            onSubmit={async (values: {
              startDate: string
              endDate: string
              checkbookAddress: string
            }) => {
              console.log("trying to submit")
              if (!activeUser.address) {
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: "You must connect your wallet in order to create RFPs",
                })
              } else {
                await createRfpMutation({
                  terminalId: terminal?.id,
                  startDate: new Date(values.startDate),
                  endDate: new Date(values.endDate),
                  authorAddress: activeUser.address,
                  fundingAddress: values.checkbookAddress,
                  contentBody: markdown,
                  contentTitle: title,
                })
              }
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
                    <label className="font-bold block">Checkbook*</label>
                    <span className="text-xs text-concrete block">
                      Checkbook is where you deposit funds to create checks for proposers to claim
                      once their projects have been approved.
                      <br />
                      <a href="#" className="text-magic-mint">
                        Learn more
                      </a>
                    </span>

                    <Field name={`checkbookAddress`}>
                      {({ input }) => (
                        <div className="custom-select-wrapper">
                          <select
                            {...input}
                            className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-1`}
                          >
                            <option value="">Choose option</option>
                            {checkbooks?.map((cb, idx) => {
                              return (
                                <option key={`checkbook-${idx}`} value={cb.address}>
                                  {cb.name}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )}
                    </Field>
                    <Link href={Routes.TerminalSettingsPage({ terminalHandle })}>
                      <span className="text-magic-mint cursor-pointer mt-1 block">
                        + Create new
                      </span>
                    </Link>

                    <div className="flex flex-col mt-6">
                      <label className="font-bold">Start Date</label>
                      <span className="text-xs text-concrete block">Proposal submission opens</span>
                      <Field name="startDate">
                        {({ input, meta }) => (
                          <div>
                            <input
                              {...input}
                              type="date"
                              className="bg-wet-concrete border border-concrete rounded p-1 mt-1 w-full"
                            />
                          </div>
                        )}
                      </Field>
                    </div>
                    <div className="flex flex-col mt-6">
                      <label className="font-bold">End Date</label>
                      <span className="text-xs text-concrete block">
                        Proposal submission closes
                      </span>
                      <Field name="endDate">
                        {({ input, meta }) => (
                          <div>
                            <input
                              {...input}
                              type="date"
                              className="bg-wet-concrete border border-concrete rounded p-1 mt-1 w-full"
                            />
                          </div>
                        )}
                      </Field>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (formState.dirty) {
                          setConfirmationModalOpen(true)
                        }
                      }}
                      className={`bg-magic-mint text-tunnel-black px-6 py-1 rounded block mx-auto ${
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

CreateRFPPage.suppressFirstRenderFlicker = true
export default CreateRFPPage