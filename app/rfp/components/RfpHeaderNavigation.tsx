import { useState, useEffect } from "react"
import { useRouter, Link, Routes, useParam, useQuery, useSession } from "blitz"
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
} from "@heroicons/react/solid"
import CloseRfpModal from "./CloseRfpModal"
import ReopenRfpModal from "./ReopenRfpModal"
import Dropdown from "app/core/components/Dropdown"
import { DeleteRfpModal } from "./DeleteRfpModal"
import useStore from "app/core/hooks/useStore"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"

const RfpHeaderNavigation = ({ rfpId }) => {
  const terminalHandle = useParam("terminalHandle") as string
  const session = useSession({ suspense: false })
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
  const setToastState = useStore((state) => state.setToastState)

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
        terminalHandle={terminalHandle}
      />
      <ReopenRfpModal isOpen={isReopenRfpModalOpen} setIsOpen={setIsReopenRfpModalOpen} rfp={rfp} />
      <CloseRfpModal isOpen={isClosedRfpModalOpen} setIsOpen={setIsClosedRfpModalOpen} rfp={rfp} />
      <div className="max-h-[250px] sm:h-60 border-b border-concrete pl-6 pt-6 pr-4">
        <div className="flex flex-row justify-between">
          <p className="self-center">
            <span className="text-concrete hover:text-light-concrete">
              <Link href={Routes.BulletinPage({ terminalHandle })}>Bulletin</Link> /&nbsp;
            </span>
            RFP: {rfp?.data?.content?.title}
          </p>
          <button
            className={`${
              rfpOpen ? "bg-electric-violet" : "bg-concrete cursor-not-allowed"
            } text-tunnel-black rounded h-[35px] px-9 hover:bg-opacity-70`}
            onClick={() => {
              if (rfpOpen) {
                router.push(Routes.CreateProposalPage({ terminalHandle, rfpId }))
              } else {
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: `You cannot create a proposal while RFP is closed.`,
                })
              }
            }}
          >
            Create proposal
          </button>
        </div>
        <div className="flex flex-row mt-6">
          <div className="flex-col w-full">
            <div className="flex flex-row items-center space-x-2 mt-3">
              <span
                className={`h-2 w-2 rounded-full ${
                  RFP_STATUS_DISPLAY_MAP[rfp?.status as string]?.color
                }`}
              />
              <span className="text-xs uppercase tracking-wider font-bold">
                {RFP_STATUS_DISPLAY_MAP[rfp?.status as string]?.copy}
              </span>
            </div>
            <div className="flex flex-row w-full mt-3">
              <div className="flex flex-col w-full">
                <div className="flex justify-between w-full">
                  <h1 className="text-2xl font-bold">RFP: {rfp?.data?.content?.title}</h1>
                  <div className="inline self-center mr-6 mb-6">
                    {isLoggedInAndIsAdmin ? (
                      <>
                        <button
                          onClick={() => {
                            router.push(Routes.EditRfpPage({ terminalHandle, rfpId }))
                          }}
                        >
                          <PencilIcon className="inline h-6 w-6 fill-marble-white mr-3 hover:cursor-pointer hover:fill-concrete" />
                        </button>
                        <Dropdown
                          className="inline"
                          side="right"
                          button={
                            <DotsHorizontalIcon className="inline-block h-6 w-6 fill-marble-white hover:cursor-pointer hover:fill-concrete" />
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
                                  setIsClosedRfpModalOpen(true)
                                } else {
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
                                setDeleteRfpModalOpen(true)
                              },
                            },
                          ]}
                        />
                      </>
                    ) : (
                      <Dropdown
                        className="inline"
                        side="right"
                        button={
                          <DotsHorizontalIcon className="inline-block h-6 w-6 fill-marble-white hover:cursor-pointer hover:fill-concrete" />
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
        </div>
        <ul className="mt-7 text-lg">
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
