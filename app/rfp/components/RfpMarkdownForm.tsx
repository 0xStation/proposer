import { useEffect, useState } from "react"
import { DateTime } from "luxon"
import { useMutation, invalidateQuery, Link, Routes, useRouter } from "blitz"
import { Field, Form } from "react-final-form"
import { LockClosedIcon, XIcon, RefreshIcon, SpeakerphoneIcon } from "@heroicons/react/solid"
import { utils } from "ethers"
import useStore from "app/core/hooks/useStore"
import useSignature from "app/core/hooks/useSignature"
import truncateString from "app/core/utils/truncateString"
import { DEFAULT_PFP_URLS, RFP_STATUS_DISPLAY_MAP } from "app/core/utils/constants"
import Preview from "app/core/components/MarkdownPreview"
import createRfp from "app/rfp/mutations/createRfp"
import updateRfp from "app/rfp/mutations/updateRfp"
import { Terminal } from "app/terminal/types"
import { Checkbook } from "app/checkbook/types"
import { Rfp } from "../types"
import getRfpsByTerminalId from "app/rfp/queries/getRfpsByTerminalId"
import ConfirmationRfpModal from "./ConfirmationRfpModal"
import {
  composeValidators,
  isPositiveAmount,
  requiredField,
  isAfterStartDate,
} from "app/utils/validators"
import { useNetwork } from "wagmi"
import { genRfpSignatureMessage } from "app/signatures/rfp"
import getFundingTokens from "app/core/utils/getFundingTokens"

import MarkdownShortcuts from "app/core/components/MarkdownShortcuts"

const getFormattedDate = ({ dateTime }: { dateTime: DateTime }) => {
  const isoDate = DateTime.fromISO(dateTime.toString())

  // min date input value needs to match the pattern nnnn-nn-nnTnn:nn
  // but isoDate.toString() returns nnnn-nn-nnTnn:nn:nn.nnn-nn:00
  // so we are slicing off the offset
  return isoDate.toString().slice(0, -13)
}

const RfpMarkdownForm = ({
  terminal,
  checkbooks,
  refetchCheckbooks,
  isEdit = false,
  rfp = undefined,
}: {
  terminal: Terminal
  refetchCheckbooks: any
  checkbooks: Checkbook[]
  isEdit?: boolean
  rfp?: Rfp
}) => {
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false)
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false)
  const [title, setTitle] = useState<string>(rfp?.data?.content?.title || "")
  const [markdown, setMarkdown] = useState<string>(rfp?.data?.content?.body || "")
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const router = useRouter()

  const { activeChain } = useNetwork()
  const chainId = activeChain?.id as number

  const tokenOptions = getFundingTokens({ chainId } as unknown as Checkbook, terminal) // hacky way to get ETH for now :(

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
      Routes.BulletinPage({ terminalHandle: terminal?.handle, rfpPublished: _data?.id })
      router.push(
        Routes.BulletinPage({ terminalHandle: terminal?.handle, rfpPublished: _data?.id })
      )
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const [updateRfpMutation] = useMutation(updateRfp, {
    onSuccess: (_data) => {
      invalidateQuery(getRfpsByTerminalId)
      router.push(
        Routes.BulletinPage({
          terminalHandle: terminal?.handle,
          rfpId: rfp?.id,
          rfpEdited: rfp?.id,
        })
      )
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  let { signMessage } = useSignature()

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
      </div>
      <Form
        initialValues={
          rfp
            ? {
                title: title,
                markdown: markdown,
                startDate: getFormattedDate({ dateTime: DateTime.fromJSDate(rfp.startDate) }),
                endDate: rfp?.endDate
                  ? getFormattedDate({ dateTime: DateTime.fromJSDate(rfp?.endDate as Date) })
                  : undefined,
                checkbookAddress: rfp?.fundingAddress,
              }
            : {
                checkbookAddress: checkbooks?.[0]?.address,
              }
        }
        onSubmit={async (values: {
          startDate: string
          endDate: string
          checkbookAddress: string
          fundingTokenAddress: string
          budgetAmount: string
          markdown: string
          title: string
        }) => {
          if (!activeUser?.address) {
            setToastState({
              isToastShowing: true,
              type: "error",
              message: "You must connect your wallet in order to create RFPs.",
            })
            return
          }
          if (!values.checkbookAddress) {
            setToastState({
              isToastShowing: true,
              type: "error",
              message: "Please select a Checkbook first.",
            })
            return
          }

          const parsedBudgetAmount = utils.parseUnits(
            values.budgetAmount.toString(),
            tokenOptions.find((t) => t.address === values.fundingTokenAddress).decimals
          )

          const message = genRfpSignatureMessage(
            { ...values, budgetAmount: parsedBudgetAmount },
            activeUser?.address
          )
          const signature = await signMessage(message)

          // user must have denied signature
          if (!signature) {
            return
          }

          if (isEdit) {
            await updateRfpMutation({
              rfpId: rfp?.id as string,
              // convert luxon's `DateTime` obj to UTC to store in db
              startDate: DateTime.fromISO(values.startDate).toUTC().toJSDate(),
              endDate: DateTime.fromISO(values.endDate).toUTC().toJSDate(),
              fundingAddress: values.checkbookAddress,
              contentBody: values.markdown,
              contentTitle: values.title,
              signature,
              signatureMessage: message,
            })
          } else {
            await createRfpMutation({
              terminalId: terminal?.id,
              // convert luxon's `DateTime` obj to UTC to store in db
              startDate: DateTime.fromISO(values.startDate).toUTC().toJSDate(),
              endDate: values.endDate
                ? DateTime.fromISO(values.endDate).toUTC().toJSDate()
                : undefined,
              authorAddress: activeUser?.address,
              fundingAddress: values.checkbookAddress,
              fundingTokenAddress: values.fundingTokenAddress,
              budgetAmount: parsedBudgetAmount.toString(),
              contentBody: values.markdown,
              contentTitle: values.title,
              signature,
              signatureMessage: message,
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
                  <div className="flex flex-row space-x-4">
                    <span className=" bg-wet-concrete rounded-full px-2 py-1 flex items-center space-x-1">
                      <SpeakerphoneIcon className="h-4 w-4 text-marble-white" />
                      <span className="text-xs uppercase">Request for proposal</span>
                    </span>
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
                  </div>
                  <div className="mt-6 flex flex-row">
                    <Field name="title" validate={requiredField}>
                      {({ input, meta }) => {
                        return (
                          <input
                            {...input}
                            className="bg-tunnel-black text-3xl ml-2 w-full outline-none"
                            placeholder="Give your RFP a title"
                          />
                        )
                      }}
                    </Field>
                  </div>
                  <div className="mt-6 flex flex-row">
                    {activeUser?.data.pfpURL ? (
                      <img
                        src={activeUser?.data.pfpURL}
                        alt="PFP"
                        className={"w-[46px] h-[46px] rounded-full"}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PFP_URLS.USER
                        }}
                      />
                    ) : (
                      <div className="h-[46px] min-w-[46px] max-w-[46px] place-self-center border border-wet-concrete bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
                    )}
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
                              placeholder="What is your DAO looking for?"
                            />
                          )
                        }}
                      </Field>
                    ) : (
                      <Preview markdown={formState.values.markdown} />
                    )}
                  </div>
                  <MarkdownShortcuts isOpen={shortcutsOpen} />
                </div>
                <div className="h-full border-l border-concrete col-span-1 flex flex-col">
                  <div className="border-b border-concrete p-4 flex flex-row space-x-8">
                    <span className="font-bold cursor-pointer">General</span>
                  </div>
                  <form className="p-4 grow flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col mt-2">
                        <label className="font-bold">Submission opens*</label>
                        <Field name="startDate" validate={requiredField}>
                          {({ input, meta }) => {
                            return (
                              <div>
                                <input
                                  {...input}
                                  type="datetime-local"
                                  min={getFormattedDate({ dateTime: DateTime.local() })}
                                  className="bg-wet-concrete border border-concrete rounded p-1 mt-1 w-full"
                                />
                                {(meta.touched || attemptedSubmit) && meta.error && (
                                  <span className="text-torch-red text-xs">{meta.error}</span>
                                )}
                              </div>
                            )
                          }}
                        </Field>
                      </div>
                      <div className="flex flex-col mt-6">
                        <label className="font-bold">Submission closes</label>
                        <Field name="endDate" validate={isAfterStartDate}>
                          {({ input, meta }) => (
                            <div>
                              <input
                                {...input}
                                type="datetime-local"
                                // dates need to match the pattern nnnn-nn-nnTnn:nn
                                min={
                                  formState.values.startDate
                                    ? getFormattedDate({
                                        dateTime: DateTime.fromISO(formState.values.startDate),
                                      })
                                    : getFormattedDate({
                                        dateTime: DateTime.local(),
                                      })
                                }
                                className="bg-wet-concrete border border-concrete rounded p-1 mt-1 w-full"
                              />
                              {meta.error && (
                                <span className="text-torch-red text-xs">{meta.error}</span>
                              )}
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="flex flex-col mt-6">
                        <label className="font-bold block">Checkbook*</label>
                        <span className="text-xs text-concrete block">
                          Deposit funds here to create checks for proposers to claim once their
                          projects have been approved.{" "}
                          <a
                            href="https://station-labs.gitbook.io/station-product-manual/for-daos-communities/checkbook"
                            className="text-electric-violet"
                          >
                            Learn more
                          </a>
                        </span>
                        <Field name={`checkbookAddress`} validate={requiredField}>
                          {({ input, meta }) => {
                            return (
                              <div className="custom-select-wrapper">
                                <select
                                  {...input}
                                  className="w-full bg-wet-concrete border border-concrete rounded p-1 mt-1"
                                >
                                  <option value="">Choose option</option>
                                  {checkbooks?.map((cb, idx) => {
                                    return (
                                      <option key={cb.address} value={cb.address}>
                                        {cb.name}
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
                        <div className="flex items-center justify-between mt-1">
                          <Link
                            href={Routes.NewCheckbookSettingsPage({
                              terminalHandle: terminal?.handle,
                            })}
                            passHref
                          >
                            <a target="_blank" rel="noopener noreferrer">
                              <span className="text-electric-violet cursor-pointer block">
                                + Create new
                              </span>
                            </a>
                          </Link>
                          <RefreshIcon
                            className="h-4 w-4 text-white cursor-pointer"
                            onClick={() => {
                              refetchCheckbooks()
                              setToastState({
                                isToastShowing: true,
                                type: "success",
                                message: "Refetched checkbooks.",
                              })
                            }}
                          />
                        </div>
                        <div className="flex flex-col mt-6">
                          <label className="font-bold block">Funding Token*</label>
                          <Field name="fundingTokenAddress" validate={requiredField}>
                            {({ input, meta }) => {
                              return (
                                <div className="custom-select-wrapper">
                                  <select
                                    {...input}
                                    className="w-full bg-wet-concrete border border-concrete rounded p-1 mt-1"
                                  >
                                    <option value="">Choose option</option>
                                    {tokenOptions?.map((token, idx) => {
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
                        <div className="flex flex-col mt-6">
                          <label className="font-bold">Budget*</label>
                          <Field
                            name="budgetAmount"
                            validate={composeValidators(requiredField, isPositiveAmount)}
                          >
                            {({ input, meta }) => {
                              return (
                                <div>
                                  <input
                                    {...input}
                                    type="text"
                                    className="bg-wet-concrete border border-concrete rounded p-1 mt-1 w-full"
                                    placeholder="e.g. 1000.00"
                                  />
                                  {(meta.touched || attemptedSubmit) && meta.error && (
                                    <span className="text-torch-red text-xs">{meta.error}</span>
                                  )}
                                </div>
                              )
                            }}
                          </Field>
                        </div>
                      </div>
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
                          setConfirmationModalOpen(true)
                        }}
                        className="bg-electric-violet text-tunnel-black px-6 py-1 rounded block mt-14 hover:bg-opacity-70"
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
