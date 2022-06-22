import { useState } from "react"
import { useMutation, invalidateQuery, Link, Routes, useRouter } from "blitz"
import { Field, Form } from "react-final-form"
import { LockClosedIcon, XIcon } from "@heroicons/react/solid"
import useStore from "app/core/hooks/useStore"
import truncateString from "app/core/utils/truncateString"
import { DEFAULT_PFP_URLS, RFP_STATUS_DISPLAY_MAP } from "app/core/utils/constants"
import Preview from "app/core/components/MarkdownPreview"
import createRfp from "app/rfp/mutations/createRfp"
import updateRfp from "app/rfp/mutations/updateRfp"
import Modal from "app/core/components/Modal"
import { Terminal } from "app/terminal/types"
import { Checkbook } from "app/checkbook/types"
import { Rfp } from "../types"
import getRfpsByTerminalId from "app/rfp/queries/getRfpsByTerminalId"

const getShortDate = (date = new Date(), isLocalTime = false) => {
  if (!date) return
  const dd = String(isLocalTime ? date.getDate() : date.getUTCDate()).padStart(2, "0")
  const mm = String((isLocalTime ? date.getMonth() : date.getUTCMonth()) + 1).padStart(2, "0") // January is 0
  const yyyy = isLocalTime ? date.getFullYear() : date.getUTCFullYear()

  console.log("shortDate", yyyy + "-" + mm + "-" + dd)
  return yyyy + "-" + mm + "-" + dd
}

const RfpMarkdownForm = ({
  terminal,
  checkbooks,
  isEdit = false,
  rfp = undefined,
}: {
  terminal: Terminal
  checkbooks: Checkbook[]
  isEdit?: boolean
  rfp?: Rfp
}) => {
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [title, setTitle] = useState(rfp?.data?.content?.title || "")
  const [markdown, setMarkdown] = useState(rfp?.data?.content?.body || "")
  const [previewMode, setPreviewMode] = useState(false)
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const router = useRouter()

  const [createRfpMutation] = useMutation(createRfp, {
    onSuccess: (_data) => {
      invalidateQuery(getRfpsByTerminalId)
      router.push(Routes.BulletinPage({ terminalHandle: terminal?.handle }))
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const [updateRfpMutation] = useMutation(updateRfp, {
    onSuccess: (_data) => {
      invalidateQuery(getRfpsByTerminalId)
      router.push(Routes.BulletinPage({ terminalHandle: terminal?.handle }))
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  console.log("start date!!!", rfp?.startDate)
  console.log("end date!!!", rfp?.endDate)

  return (
    <>
      <div className="fixed grid grid-cols-4 w-[calc(100%-70px)] border-box z-50">
        <div className="col-span-3 pt-4 pr-4 h-full bg-tunnel-black">
          <div className="text-light-concrete flex flex-row justify-between w-full">
            <button
              onClick={() => router.push(Routes.BulletinPage({ terminalHandle: terminal?.handle }))}
            >
              <XIcon className="h-6 w-6 ml-3 fill-marble-white" />
            </button>
            <div
              className="space-x-1 items-center flex cursor-pointer"
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
      <div className="grid grid-cols-4 h-screen w-full box-border">
        <div className="overflow-y-auto col-span-3 p-20 relative">
          <div className="flex flex-row items-center space-x-2">
            <span
              className={`h-2 w-2 rounded-full ${
                RFP_STATUS_DISPLAY_MAP[rfp?.status || "DRAFT"]?.color
              }`}
            />
            <span className="text-xs uppercase tracking-wider">
              {RFP_STATUS_DISPLAY_MAP[rfp?.status || "DRAFT"]?.copy}
            </span>
          </div>
          <div className="mt-6 flex flex-row">
            <span className="text-3xl font-bold">RFP:</span>
            <input
              onChange={(e) => setTitle(e.target.value)}
              className="bg-tunnel-black text-3xl ml-2 w-full outline-none"
              placeholder="Give your request a title..."
              value={title}
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
                placeholder="Enter some text..."
              />
            ) : (
              <Preview markdown={markdown} />
            )}
          </div>
        </div>
        <div className="h-full border-l border-concrete col-span-1 flex flex-col">
          <div className="border-b border-concrete p-4 flex flex-row space-x-8">
            <span className="font-bold cursor-pointer">General</span>
            <div className="flex flex-row space-x-1 items-center cursor-not-allowed">
              <LockClosedIcon className="h-4 w-4 hover:stroke-light-concrete text-concrete" />
              <span className="text-concrete">Permission</span>
            </div>
          </div>
          <Form
            initialValues={
              rfp
                ? {
                    startDate: getShortDate(rfp.startDate),
                    endDate: getShortDate(rfp?.endDate && rfp?.endDate),
                    checkbookAddress: rfp?.fundingAddress,
                  }
                : {}
            }
            onSubmit={async (values: {
              startDate: string
              endDate: string
              checkbookAddress: string
            }) => {
              if (!activeUser?.address) {
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: "You must connect your wallet in order to create RFPs",
                })
              } else if (isEdit) {
                console.log("startDate", new Date(`${values.startDate} 00:00:00 UTC`))
                console.log("endDate", new Date(`${values.endDate} 23:59:59 UTC`))
                await updateRfpMutation({
                  rfpId: rfp?.id as string,
                  startDate: new Date(`${values.startDate} 00:00:00 UTC`),
                  endDate: new Date(`${values.endDate} 23:59:59 UTC`),
                  fundingAddress: values.checkbookAddress,
                  contentBody: markdown,
                  contentTitle: title,
                })
              } else {
                await createRfpMutation({
                  terminalId: terminal?.id,
                  startDate: new Date(`${values.startDate} 00:00:00 UTC`),
                  endDate: new Date(`${values.endDate} 23:59:59 UTC`),
                  authorAddress: activeUser?.address,
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
                          className="bg-electric-violet text-tunnel-black border border-magic-mint py-1 px-4 rounded hover:opacity-75"
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
                      <a href="#" className="text-electric-violet">
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
                    <Link
                      href={Routes.NewCheckbookSettingsPage({ terminalHandle: terminal?.handle })}
                      passHref
                    >
                      <a target="_blank" rel="noopener noreferrer">
                        <span className="text-electric-violet cursor-pointer mt-1 block">
                          + Create new
                        </span>
                      </a>
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
                      className={`bg-electric-violet text-tunnel-black px-6 py-1 rounded block mx-auto ${
                        formState.values.checkbookAddress &&
                        formState.values.startDate &&
                        formState.dirty
                          ? "hover:bg-opacity-70"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      disabled={
                        !formState.values.checkbookAddress ||
                        !formState.values.startDate ||
                        (isEdit && !formState.dirty)
                      }
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
    </>
  )
}

export default RfpMarkdownForm
