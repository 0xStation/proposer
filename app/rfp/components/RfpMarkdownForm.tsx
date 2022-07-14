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
import { requiredField } from "app/utils/validators"

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
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false)
  const [title, setTitle] = useState<string>(rfp?.data?.content?.title || "")
  const [markdown, setMarkdown] = useState<string>(rfp?.data?.content?.body || "")
  const [previewMode, setPreviewMode] = useState<boolean>(false)
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
        pathname: `/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/info`,
        query: { rfpEdited: rfp?.id },
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
      <Form
        initialValues={
          rfp
            ? {
                title: title,
                markdown: markdown,
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
          markdown: string
          title: string
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
              contentBody: values.markdown,
              contentTitle: values.title,
            })
          } else {
            await createRfpMutation({
              terminalId: terminal?.id,
              startDate: new Date(`${values.startDate} 00:00:00 UTC`),
              endDate: new Date(`${values.endDate} 23:59:59 UTC`),
              authorAddress: activeUser?.address,
              fundingAddress: values.checkbookAddress,
              contentBody: values.markdown,
              contentTitle: values.title,
            })
          }
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <>
              <ConfirmationRfpModal
                isOpen={confirmationModalOpen}
                setIsOpen={setConfirmationModalOpen}
                handleSubmit={handleSubmit}
              />
              <div className="grid grid-cols-4 h-screen w-full box-border">
                <div className="overflow-y-auto col-span-3 p-20 relative">
                  <div className="flex flex-row items-center space-x-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        RFP_STATUS_DISPLAY_MAP[rfp?.status || "DRAFT"]?.color
                      }`}
                    />
                    <span className="text-xs uppercase tracking-wider font-bold">
                      {RFP_STATUS_DISPLAY_MAP[rfp?.status || "DRAFT"]?.copy}
                    </span>
                  </div>
                  <div className="mt-6 flex flex-row">
                    <span className="text-3xl font-bold">RFP:</span>
                    <Field name="title" validate={requiredField}>
                      {({ input, meta }) => {
                        return (
                          <input
                            {...input}
                            className="bg-tunnel-black text-3xl ml-2 w-full outline-none"
                            placeholder="Give your request a title..."
                          />
                        )
                      }}
                    </Field>
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
                      <Field name="markdown" validate={requiredField}>
                        {({ input, meta }) => {
                          return (
                            <textarea
                              {...input}
                              className="bg-tunnel-black w-full h-full outline-none resize-none"
                              placeholder="enter some text..."
                            />
                          )
                        }}
                      </Field>
                    ) : (
                      <Preview markdown={formState.values.markdown} />
                    )}
                  </div>
                </div>
                <div className="h-full border-l border-concrete col-span-1 flex flex-col">
                  <div className="border-b border-concrete p-4 flex flex-row space-x-8">
                    <span className="font-bold cursor-pointer">General</span>
                    <div className="flex flex-row space-x-1 items-center cursor-not-allowed">
                      <LockClosedIcon className="h-4 w-4 hover:stroke-light-concrete text-concrete" />
                      <span className="text-concrete">Custom questions</span>
                    </div>
                  </div>
                  <form className="p-4 grow flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col mt-2">
                        <label className="font-bold">Start Date*</label>
                        <span className="text-xs text-concrete block">
                          Proposal submission opens
                        </span>
                        <Field name="startDate" validate={requiredField}>
                          {({ input, meta }) => {
                            return (
                              <div>
                                <input
                                  {...input}
                                  type="date"
                                  min={getShortDate()}
                                  className="bg-wet-concrete border border-concrete rounded p-1 mt-1 w-full"
                                />
                                {((meta.touched && input.value === "") || meta.error) && (
                                  <span className="text-torch-red text-xs">{meta.error}</span>
                                )}
                              </div>
                            )
                          }}
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
                                min={getShortDate()}
                                className="bg-wet-concrete border border-concrete rounded p-1 mt-1 w-full"
                              />
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="flex flex-col mt-6">
                        <label className="font-bold block">Checkbook*</label>
                        <span className="text-xs text-concrete block">
                          Checkbook is where you deposit funds to create checks for proposers to
                          claim once their projects have been approved. You can connect RFP to
                          Checkbook later.
                          <br />
                          {/* TODO: add a link here  */}
                          <a href="#" className="text-electric-violet">
                            Learn more
                          </a>
                        </span>
                        <Field name={`checkbookAddress`} validate={requiredField}>
                          {({ input, meta }) => {
                            return (
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
                                {((meta.touched && input.value === "") || meta.error) && (
                                  <span className="text-torch-red text-xs">{meta.error}</span>
                                )}
                              </div>
                            )
                          }}
                        </Field>
                        <Link
                          href={Routes.NewCheckbookSettingsPage({
                            terminalHandle: terminal?.handle,
                          })}
                          passHref
                        >
                          <a target="_blank" rel="noopener noreferrer">
                            <span className="text-electric-violet cursor-pointer mt-1 block">
                              + Create new
                            </span>
                          </a>
                        </Link>
                      </div>
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
            </>
          )
        }}
      />
    </>
  )
}

export default RfpMarkdownForm
