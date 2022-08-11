import { useState, useEffect } from "react"
import { useRouter, Link, Routes, useParam, useQuery, useSession } from "blitz"
import { track } from "@amplitude/analytics-browser"
import { RFP_STATUS_DISPLAY_MAP } from "app/core/utils/constants"
import getRfpById from "../queries/getRfpById"
import { RfpStatus } from "../types"
import {
  TrashIcon,
  XCircleIcon,
  PencilIcon,
  InboxInIcon,
  DotsHorizontalIcon,
  ClipboardCheckIcon,
  ClipboardIcon,
  SpeakerphoneIcon,
} from "@heroicons/react/solid"
import CloseRfpModal from "./CloseRfpModal"
import ReopenRfpModal from "./ReopenRfpModal"
import Dropdown from "app/core/components/Dropdown"
import { DeleteRfpModal } from "./DeleteRfpModal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"
import useStore from "app/core/hooks/useStore"
import { trackClick } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import { useUserCanSubmitToRfp } from "app/core/utils/permissions"
import { Rfp } from "app/rfp/types"

const {
  PAGE_NAME,
  FEATURE: { RFP, PROPOSAL },
} = TRACKING_EVENTS

const RfpHeaderNavigation = ({ rfp }: { rfp: Rfp }) => {
  const terminalHandle = useParam("terminalHandle") as string
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const [isRFPUrlCopied, setIsRfpUrlCopied] = useState<boolean>(false)
  const [isClosedRfpModalOpen, setIsClosedRfpModalOpen] = useState<boolean>(false)
  const [isReopenRfpModalOpen, setIsReopenRfpModalOpen] = useState<boolean>(false)
  const [deleteRfpModalOpen, setDeleteRfpModalOpen] = useState<boolean>(false)
  const [rfpOpen, setRfpOpen] = useState<boolean>(false)
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle, refetchOnWindowFocus: false }
  )
  const [hasTagAdminPermissions] = useQuery(
    hasAdminPermissionsBasedOnTags,
    { terminalId: terminal?.id as number, accountId: session?.userId as number },
    {
      suspense: false,
    }
  )
  const isLoggedInAndIsAdmin =
    (session.siwe?.address && hasTagAdminPermissions) ||
    terminal?.data?.permissions?.accountWhitelist?.includes(session?.siwe?.address as string)
  const router = useRouter()

  useEffect(() => {
    if (rfp) {
      const today = new Date()
      if (today > rfp.startDate && (!rfp.endDate || today < rfp.endDate)) {
        setRfpOpen(true)
      }
    }
  }, [rfp])

  const canSubmit = useUserCanSubmitToRfp(session.siwe?.address, rfp)

  return (
    <>
      <DeleteRfpModal
        isOpen={deleteRfpModalOpen}
        setIsOpen={setDeleteRfpModalOpen}
        rfp={rfp}
        pageName={PAGE_NAME.RFP_INFO_PAGE}
        terminalHandle={terminalHandle}
        terminalId={terminal?.id}
      />
      <ReopenRfpModal
        isOpen={isReopenRfpModalOpen}
        setIsOpen={setIsReopenRfpModalOpen}
        rfp={rfp}
        pageName={PAGE_NAME.RFP_INFO_PAGE}
        terminalHandle={terminalHandle}
        terminalId={terminal?.id}
      />
      <CloseRfpModal
        isOpen={isClosedRfpModalOpen}
        setIsOpen={setIsClosedRfpModalOpen}
        rfp={rfp}
        pageName={PAGE_NAME.RFP_INFO_PAGE}
        terminalHandle={terminalHandle}
        terminalId={terminal?.id}
      />
      <div className="border-b border-concrete px-4 pt-4">
        <div className="flex flex-row justify-between">
          <p className="self-center">
            <span className="text-concrete hover:text-light-concrete">
              <Link href={Routes.BulletinPage({ terminalHandle })}>Requests for proposals</Link>{" "}
              /&nbsp;
            </span>
            {rfp?.data?.content?.title}
          </p>
        </div>
        <div className="flex flex-row mt-6">
          <div className="flex-col w-full">
            <div className="flex flex-row space-x-4">
              <span className=" bg-wet-concrete rounded-full px-2 py-1 flex items-center space-x-1">
                <SpeakerphoneIcon className="h-4 w-4 text-marble-white" />
                <span className="text-xs uppercase">Request for proposals</span>
              </span>
              <div className="flex flex-row items-center space-x-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    RFP_STATUS_DISPLAY_MAP[rfp?.status as string]?.color
                  }`}
                />
                <span className="text-xs uppercase tracking-wider font-bold">
                  {RFP_STATUS_DISPLAY_MAP[rfp?.status as string]?.copy}
                </span>
              </div>
            </div>
            <div className="flex flex-row w-full mt-3">
              <div className="flex flex-col w-full">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">{rfp?.data?.content?.title}</h1>
                  <div className="relative mr-6 mt-2">
                    {isLoggedInAndIsAdmin &&
                      rfp?.author?.id &&
                      session.userId &&
                      rfp?.author?.id === session.userId && (
                        <button
                          onClick={() => {
                            trackClick(RFP.EVENT_NAME.RFP_SHOW_EDITOR_CLICKED, {
                              userAddress: activeUser?.address,
                              stationHandle: terminalHandle,
                              stationId: terminal?.id,
                              isEdit: true,
                            })
                            router.push(Routes.EditRfpPage({ terminalHandle, rfpId: rfp.id }))
                          }}
                        >
                          <PencilIcon className="inline h-4 w-4 fill-marble-white mr-3 hover:cursor-pointer hover:fill-concrete" />
                        </button>
                      )}
                    {isLoggedInAndIsAdmin &&
                    rfp?.author?.id &&
                    session.userId &&
                    rfp?.author?.id === session.userId ? (
                      <Dropdown
                        className="inline"
                        side="left"
                        button={
                          <DotsHorizontalIcon className="inline-block h-4 w-4 fill-marble-white hover:cursor-pointer hover:fill-concrete" />
                        }
                        items={[
                          {
                            name: (
                              <>
                                {isRFPUrlCopied ? (
                                  <>
                                    <ClipboardCheckIcon className="h-4 w-4 mr-2 inline" />
                                    <p className="inline">Copied!</p>
                                  </>
                                ) : (
                                  <>
                                    <ClipboardIcon className="h-4 w-4 mr-2 inline" />
                                    <p className="inline">Copy link</p>
                                  </>
                                )}
                              </>
                            ),
                            onClick: () => {
                              navigator.clipboard.writeText(window.location.href).then(() => {
                                setIsRfpUrlCopied(true)
                                setTimeout(() => setIsRfpUrlCopied(false), 500)
                              })
                              setIsRfpUrlCopied(true)
                            },
                          },
                          {
                            name: (
                              <div>
                                {rfp && rfp?.status !== RfpStatus.CLOSED ? (
                                  <>
                                    <XCircleIcon className="h-4 w-4 mr-2 inline" />
                                    <p className="inline">Close for submissions</p>
                                  </>
                                ) : (
                                  <>
                                    <InboxInIcon className="h-4 w-4 mr-2 inline" />
                                    <p className="inline">Open for submissions</p>
                                  </>
                                )}
                              </div>
                            ),
                            onClick: () => {
                              if (rfp?.status !== RfpStatus.CLOSED) {
                                trackClick(RFP.EVENT_NAME.RFP_SETTINGS_CLOSE_RFP_CLICKED, {
                                  pageName: PAGE_NAME.RFP_INFO_PAGE,
                                  stationHandle: terminalHandle,
                                  stationId: terminal?.id,
                                  rfpId: rfp?.id,
                                })
                                setIsClosedRfpModalOpen(true)
                              } else {
                                trackClick(RFP.EVENT_NAME.RFP_SETTINGS_REOPEN_RFP_CLICKED, {
                                  pageName: PAGE_NAME.RFP_INFO_PAGE,
                                  stationHandle: terminalHandle,
                                  stationId: terminal?.id,
                                  rfpId: rfp?.id,
                                })
                                setIsReopenRfpModalOpen(true)
                              }
                            },
                          },
                          {
                            name: (
                              <>
                                <TrashIcon className="h-4 w-4 mr-2 fill-torch-red" />
                                <p className="text-torch-red">Delete</p>
                              </>
                            ),
                            onClick: () => {
                              trackClick(RFP.EVENT_NAME.RFP_SETTINGS_DELETE_RFP_CLICKED, {
                                pageName: PAGE_NAME.RFP_INFO_PAGE,
                                stationHandle: terminalHandle,
                                stationId: terminal?.id,
                                rfpId: rfp?.id,
                              })
                              setDeleteRfpModalOpen(true)
                            },
                          },
                        ]}
                      />
                    ) : (
                      <Dropdown
                        className="inline"
                        side="left"
                        button={
                          <DotsHorizontalIcon className="inline-block h-4 w-4 fill-marble-white hover:cursor-pointer hover:fill-concrete" />
                        }
                        items={[
                          {
                            name: (
                              <>
                                {isRFPUrlCopied ? (
                                  <>
                                    <ClipboardCheckIcon className="h-4 w-4 mr-2 inline" />
                                    <p className="inline">Copied!</p>
                                  </>
                                ) : (
                                  <>
                                    <ClipboardIcon className="h-4 w-4 mr-2 inline" />
                                    <p className="inline">Copy link</p>
                                  </>
                                )}
                              </>
                            ),
                            onClick: () => {
                              navigator.clipboard.writeText(window.location.href).then(() => {
                                setIsRfpUrlCopied(true)
                                setTimeout(() => setIsRfpUrlCopied(false), 500)
                              })
                              setIsRfpUrlCopied(true)
                            },
                          },
                        ]}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {rfpOpen && canSubmit ? (
            <button
              onClick={() => {
                trackClick(PROPOSAL.EVENT_NAME.PROPOSAL_SHOW_EDITOR_CLICKED, {
                  pageName: PAGE_NAME.RFP_INFO_PAGE,
                  stationHandle: terminalHandle,
                  stationId: terminal?.id,
                  rfpId: rfp?.id,
                })
                router.push(Routes.CreateProposalPage({ terminalHandle, rfpId: rfp.id }))
              }}
              className="bg-electric-violet text-tunnel-black rounded self-start px-6 h-[35px] leading-[35px] hover:bg-opacity-70 whitespace-nowrap"
            >
              Create proposal
            </button>
          ) : (
            <div className="relative group self-start">
              <button className="bg-electric-violet text-tunnel-black rounded self-start px-6 h-[35px] leading-[35px] bg-opacity-70 whitespace-nowrap">
                Create proposal
              </button>
              <span className="absolute top-[110%] bg-wet-concrete rounded p-2 hidden group-hover:block text-xs">
                You must hold ${rfp.data.permissions.submit.symbol} to propose.
              </span>
            </div>
          )}
        </div>
        <ul className="mt-7 text-lg mb-2">
          <li
            className={`inline mr-8 cursor-pointer ${
              router.pathname === Routes.RFPInfoTab({ terminalHandle, rfpId: rfp.id }).pathname
                ? "font-bold text-marble-white"
                : "text-concrete hover:text-light-concrete"
            }`}
          >
            <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: rfp.id })}>Info</Link>
          </li>
          <li
            className={`inline cursor-pointer ${
              router.pathname === Routes.ProposalsTab({ terminalHandle, rfpId: rfp.id }).pathname
                ? "font-bold text-marble-white"
                : "text-concrete hover:text-light-concrete"
            }`}
          >
            <Link href={Routes.ProposalsTab({ terminalHandle, rfpId: rfp.id })}>Proposals</Link>
          </li>
        </ul>
      </div>
    </>
  )
}

export default RfpHeaderNavigation
