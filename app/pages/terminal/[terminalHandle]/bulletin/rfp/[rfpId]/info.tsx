import { useState, useEffect } from "react"
import { BlitzPage, Routes, useParam, useQuery, Link, useRouterQuery } from "blitz"
import truncateString from "app/core/utils/truncateString"
import Preview from "app/core/components/MarkdownPreview"
import Layout from "app/core/layouts/Layout"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RfpHeaderNavigation from "app/rfp/components/RfpHeaderNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
import { formatDate } from "app/core/utils/formatDate"
import SuccessRfpModal from "app/rfp/components/SuccessRfpModal"

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

          <div className="w-96 border-l border-concrete pl-6 pt-6 pr-16 flex-col">
            <div className="mt-2">
              <p className="text-concrete uppercase text-xs font-bold">Start Date</p>
              <p className="mt-2">{(rfp?.startDate && formatDate(rfp?.startDate)) || "N/A"}</p>
            </div>
            <div className="mt-6">
              <p className="text-concrete uppercase text-xs font-bold">End Date</p>
              <p className="mt-2">{(rfp?.endDate && formatDate(rfp?.endDate)) || "N/A"}</p>
            </div>
            {/* TODO: make funding + signers dynamic  */}
            <div className="mt-6">
              <p className="text-concrete uppercase text-xs font-bold">Total Funding</p>
              <p className="mt-2">100.00 ETH</p>
              <p>1,500,000.00 USDC</p>
            </div>
            <div className="mt-6">
              <p className="text-concrete uppercase text-xs font-bold">Creator</p>
              <PfpComponent account={rfp?.author} className="mt-2" />
            </div>
            <div className="mt-9">
              <p className="text-xs text-concrete uppercase font-bold">Signers</p>
              {(rfp?.checkbook?.signerAccounts || []).map((account, i) => (
                <PfpComponent account={account} className="mt-4" key={i} />
              ))}
            </div>
          </div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

const PfpComponent = ({ account, className = "" }) => {
  return (
    <Link href={Routes.ProfileHome({ accountAddress: account?.address })}>
      <div className={`flex flex-row ${className}`}>
        <div className="flex flex-col content-center align-middle mr-3">
          {account?.data?.pfpURL ? (
            <img
              src={account?.data?.pfpURL}
              alt="PFP"
              className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.USER
              }}
            />
          ) : (
            <div className="h-[46px] min-w-[46px] place-self-center border border-wet-concrete bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
          )}
        </div>
        <div className="flex flex-col content-center">
          <div className="flex flex-row items-center space-x-1">
            <p className="text-base text-marble-white font-bold">{account?.data?.name}</p>
          </div>
          <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
            <p className="w-max truncate leading-4">@{truncateString(account?.address)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
export default RFPInfoTab
