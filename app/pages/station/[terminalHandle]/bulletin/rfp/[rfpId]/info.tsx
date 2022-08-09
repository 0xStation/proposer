import { useState, useEffect } from "react"
import {
  BlitzPage,
  useParam,
  useQuery,
  useRouterQuery,
  Routes,
  GetServerSideProps,
  invoke,
} from "blitz"
import { trackImpression } from "app/utils/amplitude"
import { DateTime } from "luxon"
import Preview from "app/core/components/MarkdownPreview"
import { RfpStatus } from "app/rfp/types"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RfpHeaderNavigation from "app/rfp/components/RfpHeaderNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
import SuccessRfpModal from "app/rfp/components/SuccessRfpModal"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import useAdminForTerminal from "app/core/hooks/useAdminForTerminal"
import { AddFundsModal } from "app/core/components/AddFundsModal"
import useStore from "app/core/hooks/useStore"
import { formatCurrencyAmount } from "app/core/utils/formatCurrencyAmount"
import getRfpApprovedProposalFunding from "app/rfp/queries/getRfpApprovedFunding"
import { ZERO_ADDRESS, TRACKING_EVENTS } from "app/core/utils/constants"

const {
  PAGE_NAME,
  FEATURE: { RFP },
} = TRACKING_EVENTS

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { terminalHandle, rfpId, proposalId } = context.query as {
    terminalHandle: string
    rfpId: string
    proposalId: string
  }
  const terminal = await invoke(getTerminalByHandle, { handle: terminalHandle })
  const rfp = await invoke(getRfpById, { id: rfpId })

  if (!rfp || !terminal) {
    return {
      redirect: {
        destination: Routes.BulletinPage({ terminalHandle }),
        permanent: false,
      },
    }
  }

  if (rfp.status === RfpStatus.DELETED) {
    return {
      redirect: {
        destination: Routes.RfpDeletedPage({ terminalHandle, rfpId: rfp?.id, proposalId }),
        permanent: true,
      },
    }
  }

  return {
    props: { rfp, terminal },
  }
}

const RFPInfoTab: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [showRfpSuccessModal, setShowRfpSuccessModal] = useState<boolean>(false)
  const [showAddFundsModal, setShowAddFundsModal] = useState<boolean>(false)
  const query = useRouterQuery()
  const rfpId = useParam("rfpId") as string
  const [terminal, { isSuccess: isFinishedFetchingTerminal }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    {
      suspense: false,
      enabled: !!terminalHandle,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )
  const activeUser = useStore((state) => state.activeUser)
  const isAdmin = useAdminForTerminal(terminal)
  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })
  const [rfpApprovedProposalFunding] = useQuery(
    getRfpApprovedProposalFunding,
    {
      rfpId: rfpId,
      approvalQuorum: rfp?.checkbook.quorum || 100,
      tokenChainId: rfp?.data?.funding?.token.chainId || 1,
      tokenAddress: rfp?.data?.funding?.token.address || ZERO_ADDRESS,
    },
    { suspense: false, enabled: !!rfp?.checkbook && !!rfp.data }
    // for some reason typescript does not recognize enabled checks as sufficient to remove default values in query?
  )

  useEffect(() => {
    if (isFinishedFetchingTerminal) {
      trackImpression(RFP.EVENT_NAME.RFP_INFO_PAGE_SHOWN, {
        pageName: PAGE_NAME.RFP_INFO_PAGE,
        userAddress: activeUser?.address,
        stationName: terminal?.handle,
        stationId: terminal?.id,
        rfpId: rfpId,
      })
    }
  }, [isFinishedFetchingTerminal])

  useEffect(() => {
    if (query.rfpEdited) {
      setShowRfpSuccessModal(true)
    }
  }, [query?.rfpEdited])

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}RFP`}>
      <AddFundsModal
        setIsOpen={setShowAddFundsModal}
        isOpen={showAddFundsModal}
        checkbookAddress={rfp?.checkbook?.address}
        pageName={PAGE_NAME.RFP_INFO_PAGE}
        terminalId={terminal?.id as number}
        stationName={terminalHandle}
      />
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
                <p className="mt-2 uppercase">
                  {rfp?.startDate
                    ? `${DateTime.fromJSDate(rfp.startDate as Date).toFormat(
                        "dd-MMM-yyyy"
                      )} · ${DateTime.fromJSDate(rfp.startDate as Date).toLocaleString(
                        DateTime.TIME_SIMPLE
                      )}`
                    : ""}
                </p>
              </div>
              <div className="mt-6">
                <p className="text-concrete uppercase text-xs font-bold">Close date</p>
                <p className="mt-2 uppercase">
                  {rfp?.endDate
                    ? `${DateTime.fromJSDate(rfp.endDate as Date).toFormat(
                        "dd-MMM-yyyy"
                      )} · ${DateTime.fromJSDate(rfp.endDate as Date).toLocaleString(
                        DateTime.TIME_SIMPLE
                      )}`
                    : "N/A"}
                </p>
              </div>
              <div className="mt-6">
                <p className="text-concrete uppercase text-xs font-bold">Author</p>
                <AccountMediaObject account={rfp?.author} className="mt-2" />
              </div>
            </div>
            <div className="p-6">
              <div className="mt-6">
                <p className="text-concrete uppercase text-xs font-bold">Available Funding</p>
                <div className="flex flex-row items-end space-x-1 mt-2">
                  <p className="text-2xl">
                    {formatCurrencyAmount(
                      Math.max(
                        parseFloat(rfp?.data.funding.budgetAmount || "0") -
                          (rfpApprovedProposalFunding || 0),
                        0
                      ).toString()
                    ) +
                      " " +
                      rfp?.data.funding.token.symbol}
                  </p>
                </div>
                <p className="text-concrete text-xs mt-1">{`Total RFP budget: ${formatCurrencyAmount(
                  rfp?.data.funding.budgetAmount
                )} ${rfp?.data.funding.token.symbol}`}</p>
              </div>
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
