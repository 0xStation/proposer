import { useState, useEffect } from "react"
import { BlitzPage, useParam, useQuery, useRouterQuery } from "blitz"
import Preview from "app/core/components/MarkdownPreview"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RfpHeaderNavigation from "app/rfp/components/RfpHeaderNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
import { formatDate } from "app/core/utils/formatDate"
import SuccessRfpModal from "app/rfp/components/SuccessRfpModal"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import CheckbookIndicator from "app/core/components/CheckbookIndicator"

const RFPInfoTab: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [showRfpSuccessModal, setShowRfpSuccessModal] = useState<boolean>(false)
  const query = useRouterQuery()
  const rfpId = useParam("rfpId") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })

  useEffect(() => {
    if (query.rfpEdited) {
      setShowRfpSuccessModal(true)
    }
  }, [query?.rfpEdited])

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
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

          <div className="w-96 border-l border-concrete flex-col overflow-y-scroll">
            <div className="border-b border-concrete p-6 ">
              <div className="mt-2">
                <p className="text-concrete uppercase text-xs font-bold">Start Date</p>
                <p className="mt-2">{(rfp?.startDate && formatDate(rfp?.startDate)) || "N/A"}</p>
              </div>
              <div className="mt-6">
                <p className="text-concrete uppercase text-xs font-bold">End Date</p>
                <p className="mt-2">{(rfp?.endDate && formatDate(rfp?.endDate)) || "N/A"}</p>
              </div>
              <div className="mt-6">
                <p className="text-concrete uppercase text-xs font-bold">Creator</p>
                <AccountMediaObject account={rfp?.author} className="mt-2" />
              </div>
            </div>
            <div className="p-6">
              <p className="text-concrete uppercase text-xs font-bold">Checkbook</p>
              <p className="mt-2 font-bold">{rfp?.checkbook.name}</p>
              <CheckbookIndicator checkbook={rfp?.checkbook} terminal={terminal} />

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
