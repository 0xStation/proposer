import truncateString from "app/core/utils/truncateString"
import { BlitzPage, Routes, useParam, useQuery, Link, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RFPHeaderNavigation from "app/rfp/components/RFPHeaderNavigation"

const RequestForProposalBulletinProposalsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const router = useRouter()
  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
      <TerminalNavigation>
        <RFPHeaderNavigation />
        <div className="h-[calc(100vh-240px)] flex flex-col">
          <div className="w-full h-20"></div>
          <div className="border-b border-concrete h-[44px] text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-[38rem] ml-6 mb-2">Proposal</span>
            <span className="basis-32 ml-9 mb-2">Approval</span>
            <span className="basis-32 ml-6 mb-2">Amount</span>
            <span className="basis-32 ml-2 mb-2">Submitted Date</span>
            <span className="basis-32 ml-6 mr-6 mb-2">Creator</span>
          </div>
          <div className="h-[calc(100vh-284px)] overflow-y-auto">
            {Array.from(Array(5)).map((idx) => (
              <div
                className="border-b border-concrete w-full flex flex-row cursor-pointer hover:bg-wet-concrete"
                key={idx}
              >
                <div className="basis-[38rem] ml-6 mb-2">
                  <div>
                    <div className="bg-neon-carrot rounded-full min-h-1.5 max-h-1.5 min-w-1.5 max-w-1.5 inline-block align-middle mr-1">
                      &nbsp;
                    </div>
                    <p className="uppercase text-xs inline-block mt-3">In review</p>
                  </div>
                  <h2 className="text-xl mt-2">Olympus Early Tester Program</h2>
                  <p className="text-sm mt-1 mb-3">
                    <span className="text-concrete">OIP-6</span> · Projects that educate about
                    Olympus
                  </p>
                </div>
                <div className="basis-32 ml-9 mb-2 self-center">
                  <p>0</p>
                </div>
                <div className="basis-32 ml-6 mb-2 self-center">8-JUN-2022</div>
                <div className="basis-32 ml-2 mb-2 self-center">9-JUL-2022</div>
                <div className="basis-32 ml-6 mr-6 mb-2 self-center">
                  <img
                    src={DEFAULT_PFP_URLS.USER}
                    className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
                    alt="pfp"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}
export default RequestForProposalBulletinProposalsPage
