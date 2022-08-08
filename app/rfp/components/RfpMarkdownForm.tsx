import { useEffect, useState } from "react"
import { DateTime } from "luxon"
import { useMutation, invalidateQuery, Link, Routes, useRouter, useQuery, useParam } from "blitz"
import { useNetwork, useToken } from "wagmi"
import { Field, Form } from "react-final-form"
import { XIcon, RefreshIcon, SpeakerphoneIcon } from "@heroicons/react/solid"
import { parseUnits } from "@ethersproject/units"
import useStore from "app/core/hooks/useStore"
import useSignature from "app/core/hooks/useSignature"
import truncateString from "app/core/utils/truncateString"
import {
  DEFAULT_PFP_URLS,
  ETH_METADATA,
  getStablecoinMetadataBySymbol,
  RFP_STATUS_DISPLAY_MAP,
  SUPPORTED_CHAINS,
} from "app/core/utils/constants"
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
import { genRfpSignatureMessage } from "app/signatures/rfp"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import MarkdownShortcuts from "app/core/components/MarkdownShortcuts"
import getTokenTagsByTerminalId from "app/tag/queries/getTokenTagsByTerminalId"
import { TokenType } from "app/tag/types"
import { trackClick, trackEvent, trackError } from "app/utils/amplitude"
import { TRACKING_EVENTS, TOKEN_SYMBOLS } from "app/core/utils/constants"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getCheckbooksByTerminal from "app/checkbook/queries/getCheckbooksByTerminal"

const {
  PAGE_NAME,
  FEATURE: { RFP },
} = TRACKING_EVENTS

const { ETH, USDC } = TOKEN_SYMBOLS

const getFormattedDate = ({ dateTime }: { dateTime: DateTime }) => {
  const isoDate = DateTime.fromISO(dateTime.toString())

  // min date input value needs to match the pattern nnnn-nn-nnTnn:nn
  // but isoDate.toString() returns nnnn-nn-nnTnn:nn:nn.nnn-nn:00
  // so we are slicing off the offset
  return isoDate.toString().slice(0, -13)
}

const RfpMarkdownForm = ({ isEdit = false, rfp = undefined }: { isEdit?: boolean; rfp?: Rfp }) => {
  const { chain: activeChain } = useNetwork()
  const [checkbookOptions, setCheckbookOptions] = useState<Checkbook[]>()
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false)
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false)
  const [title, setTitle] = useState<string>(rfp?.data?.content?.title || "")
  const [markdown, setMarkdown] = useState<string>(rfp?.data?.content?.body || "")
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [importedTokenOptions, setImportedTokenOptions] = useState<any[]>()
  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(
    rfp?.data?.funding?.token?.chainId || (activeChain?.id as number)
  )
  const [selectedToken, setSelectedToken] = useState<any>(ETH_METADATA)
  const [selectedCheckbook, setSelectedCheckbook] = useState<Checkbook>()
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [currentTab, setCurrentTab] = useState<"GENERAL" | "PERMISSION">("GENERAL")
  const router = useRouter()
  const defaultTokenOptionSymbols = [ETH, USDC]

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { isSuccess: finishedFetchingTerminal }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle, refetchOnWindowFocus: false }
  )

  const [checkbooks, { refetch: refetchCheckbooks, isSuccess: finishedFetchingCheckbooks }] =
    useQuery(
      getCheckbooksByTerminal,
      { terminalId: terminal?.id || 0 },
      { suspense: false, enabled: !!finishedFetchingTerminal, refetchOnWindowFocus: false }
    )

  const {
    data: balanceData,
    refetch: refetchToken,
    isSuccess: tokenFetchSuccess,
  } = useToken({
    address: selectedToken?.address as string,
    chainId: selectedNetworkId as number,
    enabled: !!selectedToken?.address && !!selectedNetworkId,
  })

  const [tags, { refetch: refetchTags, isSuccess: finishedFetchingTags }] = useQuery(
    getTokenTagsByTerminalId,
    { terminalId: terminal?.id as number },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )

  useEffect(() => {
    if (selectedNetworkId) {
      // filter tokens based on selected network
      const filteredTokenOptions = tags
        ?.filter(
          (tag) =>
            tag?.data?.type === TokenType.ERC20 &&
            tag?.data?.chainId === selectedNetworkId &&
            tag?.data?.symbol !== USDC &&
            tag?.data?.symbol !== ETH
        )
        ?.map((tag) => tag?.data)

      setImportedTokenOptions(filteredTokenOptions)

      setSelectedToken(filteredTokenOptions?.[0] || ETH_METADATA)

      // filter checkbooks based on selected network
      const filteredCheckbookOptions = checkbooks?.filter(
        (checkbook) => checkbook.chainId === selectedNetworkId
      )
      setCheckbookOptions(filteredCheckbookOptions)
      setSelectedCheckbook(filteredCheckbookOptions?.[0])
    }
  }, [selectedNetworkId, finishedFetchingTags, finishedFetchingCheckbooks])

  useEffect(() => {
    trackClick(RFP.EVENT_NAME.RFP_EDITOR_PAGE_SHOWN, {
      pageName: PAGE_NAME.RFP_EDITOR_PAGE,
      userAddress: activeUser?.address,
      stationHandle: terminal?.handle as string,
      stationId: terminal?.id,
    })
  }, [])

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
      trackEvent(RFP.EVENT_NAME.RFP_CREATED, {
        pageName: PAGE_NAME.RFP_EDITOR_PAGE,
        userAddress: activeUser?.address,
        stationHandle: terminal?.handle as string,
        stationId: terminal?.id,
      })
      invalidateQuery(getRfpsByTerminalId)
      Routes.BulletinPage({ terminalHandle: terminalHandle as string, rfpPublished: _data?.id })
      router.push(
        Routes.BulletinPage({ terminalHandle: terminalHandle as string, rfpPublished: _data?.id })
      )
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const [updateRfpMutation] = useMutation(updateRfp, {
    onSuccess: (_data) => {
      trackEvent(RFP.EVENT_NAME.RFP_EDITED, {
        pageName: PAGE_NAME.RFP_EDITOR_PAGE,
        userAddress: activeUser?.address,
        stationHandle: terminalHandle as string,
        stationId: terminal?.id,
        rfpId: rfp?.id,
      })
      invalidateQuery(getRfpsByTerminalId)
      router.push(
        Routes.BulletinPage({
          terminalHandle: terminalHandle as string,
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
      <div className="fixed grid grid-cols-4 w-[calc(100%-70px)] border-box z-40">
        <div className="col-span-3 pt-4 pr-4 h-full bg-tunnel-black">
          <div className="text-light-concrete flex flex-row justify-between w-full">
            <button
              onClick={() => {
                if (isEdit) {
                  router.push(
                    Routes.RFPInfoTab({
                      terminalHandle: terminalHandle as string,
                      rfpId: rfp?.id as string,
                    })
                  )
                } else {
                  router.push(Routes.BulletinPage({ terminalHandle: terminalHandle as string }))
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
                fundingTokenSymbol: rfp.data.funding.token.symbol,
                budgetAmount: rfp.data.funding.budgetAmount,
                submittingPermission: rfp.data.permissions.submit,
                viewingPermission: rfp.data.permissions.view,
              }
            : {
                checkbookAddress: checkbooks?.[0]?.address,
              }
        }
        onSubmit={async (values: {
          startDate: string
          endDate: string
          checkbookAddress: string
          fundingTokenSymbol: string
          budgetAmount: string
          markdown: string
          title: string
          submittingPermission: string
          viewingPermission: string
        }) => {
          trackClick(RFP.EVENT_NAME.RFP_EDITOR_MODAL_PUBLISH_CLICKED, {
            pageName: PAGE_NAME.RFP_EDITOR_PAGE,
            userAddress: activeUser?.address,
            stationHandle: terminal?.handle as string,
            stationId: terminal?.id,
            startDate: values.startDate,
            endDate: values.endDate,
            checkbookAddress: values.checkbookAddress,
            title: values.title,
          })
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

          const checkbook = checkbooks?.find((checkbook) =>
            addressesAreEqual(checkbook.address, values.checkbookAddress)
          )

          if (!checkbook) {
            setToastState({
              isToastShowing: true,
              type: "error",
              message: "Could not find selected Checkbook.",
            })
            return
          }

          if (selectedToken.symbol !== ETH && selectedToken.symbol !== USDC) {
            if (tokenFetchSuccess) {
              selectedToken.decimals = balanceData?.decimals
            } else {
              setToastState({
                isToastShowing: true,
                type: "error",
                message: "Unable to retrieve decimals for the provided token.",
              })
              return
            }
          }

          if (!selectedToken) {
            setToastState({
              isToastShowing: true,
              type: "error",
              message: "Could not find token.",
            })
            return
          }

          const parsedBudgetAmount = parseUnits(values.budgetAmount, selectedToken.decimals)

          const message = genRfpSignatureMessage(
            {
              ...values,
              fundingTokenAddress: selectedToken.address,
              budgetAmount: parsedBudgetAmount,
            },
            activeUser?.address
          )
          const signature = await signMessage(message)

          // user must have denied signature
          if (!signature) {
            return
          }

          if (isEdit) {
            try {
              await updateRfpMutation({
                rfpId: rfp?.id as string,
                // convert luxon's `DateTime` obj to UTC to store in db
                startDate: DateTime.fromISO(values.startDate).toUTC().toJSDate(),
                endDate: DateTime.fromISO(values.endDate).toUTC().toJSDate(),
                fundingAddress: values.checkbookAddress,
                fundingToken: {
                  chainId: checkbook.chainId,
                  address: selectedToken.address,

                  symbol: selectedToken.symbol,
                  decimals: selectedToken.decimals,
                },
                submittingPermission: values.submittingPermission,
                viewingPermission: values.viewingPermission,
                fundingBudgetAmount: values.budgetAmount,
                contentBody: values.markdown,
                contentTitle: values.title,
                signature,
                signatureMessage: message,
              })
            } catch (err) {
              console.error(err)
              trackError(RFP.EVENT_NAME.ERROR_EDITING_RFP, {
                pageName: PAGE_NAME.RFP_EDITOR_PAGE,
                userAddress: activeUser?.address,
                stationHandle: terminalHandle as string,
                stationId: terminal?.id,
                startDate: values.startDate,
                endDate: values.endDate,
                checkbookAddress: values.checkbookAddress,
                title: values.title,
                rfpId: rfp?.id,
                errorMsg: err.message,
              })
            }
          } else {
            try {
              await createRfpMutation({
                terminalId: terminal?.id as number,
                // convert luxon's `DateTime` obj to UTC to store in db
                startDate: DateTime.fromISO(values.startDate).toUTC().toJSDate(),
                endDate: values.endDate
                  ? DateTime.fromISO(values.endDate).toUTC().toJSDate()
                  : undefined,
                authorAddress: activeUser?.address,
                fundingAddress: values.checkbookAddress,
                fundingToken: {
                  chainId: checkbook.chainId,
                  address: selectedToken.address,
                  symbol: selectedToken.symbol,
                  decimals: selectedToken.decimals,
                },
                submittingPermission: values.submittingPermission,
                viewingPermission: values.viewingPermission,
                fundingBudgetAmount: values.budgetAmount,
                contentBody: values.markdown,
                contentTitle: values.title,
                signature,
                signatureMessage: message,
              })
            } catch (err) {
              console.error(err)
              trackError(RFP.EVENT_NAME.ERROR_CREATING_RFP, {
                pageName: PAGE_NAME.RFP_EDITOR_PAGE,
                userAddress: activeUser?.address,
                stationHandle: terminal?.handle as string,
                stationId: terminal?.id,
                startDate: values.startDate,
                endDate: values.endDate,
                checkbookAddress: values.checkbookAddress,
                title: values.title,
                rfpId: rfp?.id,
                errorMsg: err.message,
              })
            }
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
                <div className="h-full border-l border-concrete col-span-1 flex flex-col z-50">
                  <div className="border-b border-concrete px-4 pt-4 flex flex-row space-x-4">
                    <span
                      className={`cursor-pointer ${
                        currentTab === "GENERAL" && "mb-[-1px] border-b-2 font-bold"
                      }`}
                      onClick={() => setCurrentTab("GENERAL")}
                    >
                      General
                    </span>
                    <span
                      className={`cursor-pointer ${
                        currentTab === "PERMISSION" && "mb-[-1px] border-b-2 font-bold"
                      }`}
                      onClick={() => setCurrentTab("PERMISSION")}
                    >
                      Permission
                    </span>
                  </div>
                  <form className="p-4 grow flex flex-col justify-between">
                    {currentTab === "GENERAL" ? (
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
                          <Field name="endDate">
                            {({ input, meta }) => {
                              return (
                                <div>
                                  <input
                                    {...input}
                                    type="datetime-local"
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
                                  {(meta.touched || attemptedSubmit) && meta.error && (
                                    <span className="text-torch-red text-xs">{meta.error}</span>
                                  )}
                                </div>
                              )
                            }}
                          </Field>
                        </div>
                        <div className="flex flex-col mt-6">
                          <label className="font-bold">Network*</label>
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
                        </div>
                        <div className="flex flex-col mt-6">
                          <label className="font-bold block">Reward token*</label>
                          <Field name="fundingTokenSymbol">
                            {({ input, meta }) => {
                              return (
                                <div className="custom-select-wrapper">
                                  <select
                                    {...input}
                                    className="w-full bg-wet-concrete border border-concrete rounded p-1 mt-1"
                                    value={selectedToken.symbol as string}
                                    onChange={(e) => {
                                      let fundingToken
                                      if (e.target.value === ETH) {
                                        fundingToken = ETH_METADATA
                                      } else if (e.target.value === USDC) {
                                        fundingToken = getStablecoinMetadataBySymbol({
                                          chain: selectedNetworkId,
                                          symbol: USDC,
                                        })
                                      } else {
                                        fundingToken = importedTokenOptions?.find(
                                          (token) => token.symbol === e.target.value
                                        )
                                      }
                                      setSelectedToken(fundingToken)
                                      // custom values can be compatible with react-final-form by calling
                                      // the props.input.onChange callback
                                      // https://final-form.org/docs/react-final-form/api/Field
                                      input.onChange(fundingToken?.symbol)

                                      refetchToken()
                                    }}
                                  >
                                    <option value="">Choose option</option>
                                    {importedTokenOptions?.map((token, idx) => {
                                      return (
                                        <option key={token.address} value={token.symbol}>
                                          {token.symbol}
                                        </option>
                                      )
                                    })}
                                    {defaultTokenOptionSymbols.map((tokenSymbol) => (
                                      <option key={tokenSymbol} value={tokenSymbol}>
                                        {tokenSymbol}
                                      </option>
                                    ))}
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
                              href={Routes.NewTokenSettingsPage({
                                terminalHandle: terminalHandle as string,
                              })}
                              passHref
                            >
                              <a target="_blank" rel="noopener noreferrer">
                                <span className="text-electric-violet cursor-pointer block">
                                  + Import
                                </span>
                              </a>
                            </Link>
                            <RefreshIcon
                              className="h-4 w-4 text-white cursor-pointer"
                              onClick={() => {
                                refetchTags()
                                setToastState({
                                  isToastShowing: true,
                                  type: "success",
                                  message: "Refetched tokens.",
                                })
                              }}
                            />
                          </div>
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
                          <Field name="checkbookAddress">
                            {({ input, meta }) => {
                              return (
                                <div className="custom-select-wrapper">
                                  <select
                                    {...input}
                                    className="w-full bg-wet-concrete border border-concrete rounded p-1 mt-1"
                                    onChange={(e) => {
                                      const checkbook = checkbookOptions?.find(
                                        (checkbook) => checkbook.address === e.target.value
                                      )
                                      setSelectedCheckbook(checkbook)
                                      // custom values can be compatible with react-final-form by calling
                                      // the props.input.onChange callback
                                      // https://final-form.org/docs/react-final-form/api/Field
                                      input.onChange(checkbook?.address as string)
                                    }}
                                  >
                                    <option value="">Choose option</option>
                                    {checkbookOptions?.map((cb, idx) => {
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
                                terminalHandle: terminalHandle,
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
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            trackClick(RFP.EVENT_NAME.RFP_EDITOR_PUBLISH_CLICKED, {
                              pageName: PAGE_NAME.RFP_EDITOR_PAGE,
                              userAddress: activeUser?.address,
                              stationHandle: terminal?.handle as string,
                              stationId: terminal?.id,
                            })
                            setAttemptedSubmit(true)
                            if (
                              formState.invalid ||
                              !selectedToken ||
                              !selectedNetworkId ||
                              !selectedCheckbook
                            ) {
                              if (!selectedNetworkId) {
                                setToastState({
                                  isToastShowing: true,
                                  type: "error",
                                  message: `Please fill in the Network field to publish your RFP.`,
                                })
                                return
                              }

                              if (!formState.values.fundingTokenSymbol && !selectedToken) {
                                setToastState({
                                  isToastShowing: true,
                                  type: "error",
                                  message: `Please fill in the Reward token field to publish your RFP.`,
                                })
                                return
                              }

                              if (!selectedCheckbook) {
                                setToastState({
                                  isToastShowing: true,
                                  type: "error",
                                  message: `Please add a Checkbook to publish your RFP.`,
                                })
                                return
                              }
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
                    ) : (
                      <div>
                        <div className="flex flex-col">
                          <label className="font-bold">Submitting proposals</label>
                          <span className="text-xs text-concrete">
                            Only those who hold this token will be able to submit a proposal to this
                            RFP.
                          </span>
                          <Field name="submittingPermission">
                            {({ input, meta }) => {
                              return (
                                <div>
                                  <input
                                    {...input}
                                    type="text"
                                    className="bg-wet-concrete border border-concrete rounded p-1 mt-1 w-full"
                                    placeholder="Paste address"
                                  />
                                </div>
                              )
                            }}
                          </Field>
                        </div>
                        <div className="flex flex-col mt-6">
                          <label className="font-bold">Viewing proposals</label>
                          <span className="text-xs text-concrete">
                            Only those who hold this token will be able to view a proposal to this
                            RFP.
                          </span>
                          <Field name="viewingPermission">
                            {({ input, meta }) => {
                              return (
                                <div>
                                  <input
                                    {...input}
                                    type="text"
                                    className="bg-wet-concrete border border-concrete rounded p-1 mt-1 w-full"
                                    placeholder="Paste address"
                                  />
                                </div>
                              )
                            }}
                          </Field>
                        </div>
                      </div>
                    )}
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
