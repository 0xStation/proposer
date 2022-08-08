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

const RfpHeaderNavigation = ({ rfpId }) => {
  const terminalHandle = useParam("terminalHandle") as string
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const [isRFPUrlCopied, setIsRfpUrlCopied] = useState<boolean>(false)
  const [isClosedRfpModalOpen, setIsClosedRfpModalOpen] = useState<boolean>(false)
  const [isReopenRfpModalOpen, setIsReopenRfpModalOpen] = useState<boolean>(false)
  const [deleteRfpModalOpen, setDeleteRfpModalOpen] = useState<boolean>(false)
  const [rfpOpen, setRfpOpen] = useState<boolean>(false)
  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })
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

  return (
    <>
      <DeleteRfpModal
        isOpen={deleteRfpModalOpen}
        setIsOpen={setDeleteRfpModalOpen}
        rfp={rfp}
        pageName={"rfp_info_page"}
        terminalHandle={terminalHandle}
        terminalId={terminal?.id}
      />
      <ReopenRfpModal
        isOpen={isReopenRfpModalOpen}
        setIsOpen={setIsReopenRfpModalOpen}
        rfp={rfp}
        pageName="rfp_info_page"
        terminalHandle={terminalHandle}
        terminalId={terminal?.id}
      />
      <CloseRfpModal
        isOpen={isClosedRfpModalOpen}
        setIsOpen={setIsClosedRfpModalOpen}
        rfp={rfp}
        pageName="rfp_info_page"
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
                            track("rfp_show_editor_clicked", {
                              event_category: "click",
                              address: activeUser?.address,
                              station_name: terminalHandle,
                              station_id: terminal?.id,
                              is_edit: true,
                            })
                            router.push(Routes.EditRfpPage({ terminalHandle, rfpId }))
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
                                track("rfp_settings_close_rfp_clicked", {
                                  event_category: "click",
                                  page: "rfp_info_page",
                                  station_name: terminalHandle,
                                  station_id: terminal?.id,
                                  rfp_id: rfp?.id,
                                })
                                setIsClosedRfpModalOpen(true)
                              } else {
                                track("rfp_settings_reopen_rfp_clicked", {
                                  event_category: "click",
                                  page: "rfp_info_page",
                                  station_name: terminalHandle,
                                  station_id: terminal?.id,
                                  rfp_id: rfp?.id,
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
                              track("rfp_settings_delete_rfp_clicked", {
                                event_category: "click",
                                page: "rfp_info_page",
                                station_name: terminalHandle,
                                station_id: terminal?.id,
                                rfp_id: rfp?.id,
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
          {rfpOpen && (
            <Link href={Routes.CreateProposalPage({ terminalHandle, rfpId })} passHref>
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="bg-electric-violet text-tunnel-black rounded self-start px-6 h-[35px] leading-[35px] hover:bg-opacity-70 whitespace-nowrap"
              >
                Create proposal
              </a>
            </Link>
          )}
        </div>
        <ul className="mt-7 text-lg mb-2">
          <li
            className={`inline mr-8 cursor-pointer ${
              router.pathname === Routes.RFPInfoTab({ terminalHandle, rfpId: rfpId }).pathname
                ? "font-bold text-marble-white"
                : "text-concrete hover:text-light-concrete"
            }`}
          >
            <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: rfpId })}>Info</Link>
          </li>
          <li
            className={`inline cursor-pointer ${
              router.pathname === Routes.ProposalsTab({ terminalHandle, rfpId: rfpId }).pathname
                ? "font-bold text-marble-white"
                : "text-concrete hover:text-light-concrete"
            }`}
          >
            <Link href={Routes.ProposalsTab({ terminalHandle, rfpId: rfpId })}>Proposals</Link>
          </li>
        </ul>
      </div>
    </>
  )
}

export default RfpHeaderNavigation
