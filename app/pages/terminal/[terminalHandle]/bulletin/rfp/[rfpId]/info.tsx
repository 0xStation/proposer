import { useState, useEffect } from "react"
import { BlitzPage, useParam, useQuery, useRouterQuery, Link, Routes } from "blitz"
import Preview from "app/core/components/MarkdownPreview"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RfpHeaderNavigation from "app/rfp/components/RfpHeaderNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
import useStore from "app/core/hooks/useStore"
import { formatDate } from "app/core/utils/formatDate"
import SuccessRfpModal from "app/rfp/components/SuccessRfpModal"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import CheckbookIndicator from "app/core/components/CheckbookIndicator"
import Modal from "app/core/components/Modal"
import useAdminForTerminal from "app/core/hooks/useAdminForTerminal"

const RFPInfoTab: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const terminalHandle = useParam("terminalHandle") as string
  const [showRfpSuccessModal, setShowRfpSuccessModal] = useState<boolean>(false)
  const [isModalAddressCopied, setIsModalAddressCopied] = useState<boolean>(false)
  const [showAddFundsModal, setShowAddFundsModal] = useState<boolean>(false)
  const query = useRouterQuery()
  const rfpId = useParam("rfpId") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const isAdmin = useAdminForTerminal(terminal)
  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })

  useEffect(() => {
    if (query.rfpEdited) {
      setShowRfpSuccessModal(true)
    }
  }, [query?.rfpEdited])

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
      <Modal open={showAddFundsModal} toggle={setShowAddFundsModal}>
        <div className="p-2">
          <h3 className="text-2xl font-bold pt-6">Add funds to this Checkbook.</h3>
          <p className="mt-2">Please transfer funds to the contract address.</p>
          <div className="mt-8">
            <button
              className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75"
              onClick={() => {
                navigator.clipboard.writeText(rfp?.checkbook?.address as string).then(() => {
                  setIsModalAddressCopied(true)
                  setTimeout(() => {
                    setShowAddFundsModal(false)
                    // need to set addressCopied to false so if the modal is opened again it does not say copied still
                    // need to put it in a timeout or else it changes while the modal is fading out
                    // not a huge fan of this nested timeout but ig its not too bad. It would be cool if you could fire
                    // a callback once the component (modal in this case) unmounted completely
                    setTimeout(() => {
                      setIsModalAddressCopied(false)
                    }, 200)
                  }, 450) // slight delay before closing modal
                })
              }}
            >
              {isModalAddressCopied ? "Copied!" : "Copy Address"}
            </button>
          </div>
        </div>
      </Modal>
      <TerminalNavigation>
        <SuccessRfpModal
          terminal={terminal}
          setIsOpen={setShowRfpSuccessModal}
          isOpen={showRfpSuccessModal}
          rfpId={query?.rfpEdited}
          isEdit={true}
        />
        <RfpHeaderNavigation rfpId={rfpId} />
        <div className="h-[calc(100vh-240px)] flex flex-row">
          <div className="w-full p-6 overflow-y-scroll">
            <Preview markdown={rfp?.data?.content?.body} />
          </div>

          <div className="w-[36rem] border-l border-concrete flex-col overflow-y-scroll">
            <div className="border-b border-concrete p-6 ">
              <div className="mt-2">
                <p className="text-concrete uppercase text-xs font-bold">Open date</p>
                <p className="mt-2">{(rfp?.startDate && formatDate(rfp?.startDate)) || "N/A"}</p>
              </div>
              <div className="mt-6">
                <p className="text-concrete uppercase text-xs font-bold">Close date</p>
                <p className="mt-2">{(rfp?.endDate && formatDate(rfp?.endDate)) || "N/A"}</p>
              </div>
              <div className="mt-6">
                <p className="text-concrete uppercase text-xs font-bold">Author</p>
                <AccountMediaObject account={rfp?.author} className="mt-2" />
              </div>
            </div>
            <div className="p-6">
              <CheckbookIndicator checkbook={rfp?.checkbook} terminal={terminal} />
              <p className="mt-4 text-sm">
                Checkbook:{" "}
                {isAdmin ? (
                  <Link href={Routes.CheckbookSettingsPage({ terminalHandle })}>
                    <span className="text-electric-violet cursor-pointer">
                      {rfp?.checkbook.name}
                    </span>
                  </Link>
                ) : (
                  <span className="text-marble-white">{rfp?.checkbook.name}</span>
                )}
              </p>
              {isAdmin && (
                <button
                  className="border border-electric-violet rounded text-electric-violet px-6 h-[35px] mt-2"
                  onClick={() => setShowAddFundsModal(true)}
                >
                  Add funds
                </button>
              )}

              <div className="mt-9">
                <p className="text-xs text-concrete uppercase font-bold">Signers</p>
                {(rfp?.checkbook?.signerAccounts || []).map((account, i) => (
                  <AccountMediaObject account={account} className="mt-4" key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

export default RFPInfoTab
