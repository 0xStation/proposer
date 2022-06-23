import { useEffect, useState } from "react"
import { useMutation, invalidateQuery, Link, Routes, useRouter } from "blitz"
import { Field, Form } from "react-final-form"
import { LockClosedIcon, XIcon } from "@heroicons/react/solid"
import useStore from "app/core/hooks/useStore"
import truncateString from "app/core/utils/truncateString"
import { DEFAULT_PFP_URLS, RFP_STATUS_DISPLAY_MAP } from "app/core/utils/constants"
import Preview from "app/core/components/MarkdownPreview"
import createRfp from "app/rfp/mutations/createRfp"
import updateRfp from "app/rfp/mutations/updateRfp"
import { Terminal } from "app/terminal/types"
import { Checkbook } from "app/checkbook/types"
import { Rfp } from "../types"
import getRfpsByTerminalId from "app/rfp/queries/getRfpsByTerminalId"
import { getShortDate } from "app/core/utils/getShortDate"
import ConfirmationRfpModal from "./ConfirmationRfpModal"

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
  const [isRfpEditorDirty, setRfpEditorDirty] = useState(false)
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const router = useRouter()

  useEffect(() => {
    if (rfp?.data?.content?.title) {
      setTitle(rfp?.data?.content?.title)
    }
  }, [rfp?.data?.content?.title])

  useEffect(() => {
    if (rfp?.data?.content?.body) {
      setMarkdown(rfp?.data?.content?.body)
    }
  }, [rfp?.data?.content?.body])

  const [createRfpMutation] = useMutation(createRfp, {
    onSuccess: (_data) => {
      invalidateQuery(getRfpsByTerminalId)
      router.push({
        pathname: `/terminal/${terminal?.handle}/bulletin`,
        query: { rfpPublished: _data?.id },
      })
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const [updateRfpMutation] = useMutation(updateRfp, {
    onSuccess: (_data) => {
      invalidateQuery(getRfpsByTerminalId)
      router.push({
        pathname: `/terminal/${terminal?.handle}/bulletin`,
        query: { rfpPublished: rfp?.id },
      })
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <>
      <div className="fixed grid grid-cols-4 w-[calc(100%-70px)] border-box z-50">
        <div className="col-span-3 pt-4 pr-4 h-full bg-tunnel-black">
          <div className="text-light-concrete flex flex-row justify-between w-full">
            <button
              onClick={() => {
                if (isEdit) {
                  router.push(
                    Routes.RFPInfoTab({
                      terminalHandle: terminal?.handle,
                      rfpId: rfp?.id as string,
                    })
                  )
                } else {
                  router.push(Routes.BulletinPage({ terminalHandle: terminal?.handle }))
                }
              }}
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
              onChange={(e) => {
                setTitle(e.target.value)
                if (!isRfpEditorDirty) {
                  setRfpEditorDirty(true)
                } else if (
                  e.target.value &&
                  e.target.value === rfp?.data?.content?.title &&
                  markdown &&
                  markdown === rfp?.data?.content?.body
                ) {
                  setRfpEditorDirty(false)
                }
              }}
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
                onChange={(e) => {
                  setMarkdown(e.target.value.length > 0 ? e.target.value : "")
                  if (!isRfpEditorDirty) {
                    setRfpEditorDirty(true)
                  } else if (
                    title &&
                    title === rfp?.data?.content?.title &&
                    e.target.value &&
                    e.target.value === rfp?.data?.content?.body
                  ) {
                    setRfpEditorDirty(false)
                  }
                }}
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
                  <ConfirmationRfpModal
                    isOpen={confirmationModalOpen}
                    setIsOpen={setConfirmationModalOpen}
                    handleSubmit={handleSubmit}
                  />
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
                        (formState.dirty || isRfpEditorDirty)
                          ? "hover:bg-opacity-70 cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      disabled={
                        !formState.values.checkbookAddress ||
                        !formState.values.startDate ||
                        (isEdit && !formState.dirty) ||
                        !isRfpEditorDirty
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
