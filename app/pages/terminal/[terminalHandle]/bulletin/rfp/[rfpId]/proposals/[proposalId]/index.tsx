import {
  BlitzPage,
  Routes,
  useParam,
  Link,
  invoke,
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "blitz"
import { useState } from "react"
import Layout from "app/core/layouts/Layout"
import Preview from "app/core/components/MarkdownPreview"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
import getProposalById from "app/proposal/queries/getProposalById"
import { Rfp } from "app/rfp/types"
import { Proposal } from "app/proposal/types"
import { Check } from "app/check/types"
import { PROPOSAL_STATUS_DISPLAY_MAP } from "app/core/utils/constants"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import ProgressIndicator from "app/core/components/ProgressIndicator"
import CashCheckModal from "app/check/components/CashCheckModal"
import getChecksByProposalId from "app/check/queries/getChecksByProposalId"
import AccountPfp from "app/core/components/AccountPfp"
import networks from "app/utils/networks.json"
import LinkArrow from "app/core/icons/LinkArrow"

type GetServerSidePropsData = {
  rfp: Rfp
  proposal: Proposal
  checks: Check[]
}

const ProposalPage: BlitzPage = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const terminalHandle = useParam("terminalHandle") as string
  const [cashCheckModalOpen, setCashCheckModalOpen] = useState<boolean>(false)

  // useful for P0 while we only expect one check
  const primaryCheck = data.checks[0]

  return (
    <Layout title={`Proposals`}>
      {!!primaryCheck && (
        <CashCheckModal
          isOpen={cashCheckModalOpen}
          setIsOpen={setCashCheckModalOpen}
          check={primaryCheck}
        />
      )}
      <TerminalNavigation>
        <div className="grid grid-cols-3 h-screen w-full box-border">
          <div className="col-span-2 p-6">
            <p className="self-center">
              <span className="text-concrete hover:text-light-concrete">
                <Link href={Routes.BulletinPage({ terminalHandle })}>Bulletin</Link> /&nbsp;
              </span>
              <span className="text-concrete hover:text-light-concrete">
                <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: data.rfp.id })}>
                  {`RFP: ${data.rfp?.data?.content?.title}`}
                </Link>{" "}
                /&nbsp;
              </span>
              {data.proposal.data.content.title}
            </p>

            <div className="flex flex-row items-center space-x-2 mt-6">
              <span
                className={`h-2 w-2 rounded-full ${
                  PROPOSAL_STATUS_DISPLAY_MAP[data.proposal.status]?.color || "bg-concrete"
                }`}
              />
              <span className="text-xs uppercase tracking-wider">
                {PROPOSAL_STATUS_DISPLAY_MAP[data.proposal.status]?.copy}
              </span>
            </div>
            <h1 className="mt-6 text-2xl font-bold">{data.proposal.data.content.title}</h1>
            {/* collaborators would go here, but we have not created collaborators yet */}
            <div className="w-full overflow-y-scroll mt-6">
              <Preview markdown={data.proposal.data.content.body} />
            </div>
          </div>
          <div className="col-span-1 h-full border-l border-concrete flex flex-col">
            <div className="border-b border-concrete p-6">
              <h4 className="text-xs font-bold text-concrete uppercase">Terminal</h4>
              <div className="flex flex-row items-center mt-2">
                <img
                  src={data.rfp.terminal.data.pfpURL}
                  alt="PFP"
                  className="w-[46px] h-[46px] rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
                  }}
                />
                <div className="ml-2">
                  <span>{data.rfp.terminal.data.name}</span>
                  <span className="text-xs text-light-concrete flex">
                    @{data.rfp.terminal.handle}
                  </span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">
                Request for Proposal
              </h4>
              <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: data.rfp.id })}>
                <p className="mt-2 text-electric-violet cursor-pointer">
                  {data.rfp.data.content.title}
                </p>
              </Link>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">Total Amount</h4>
              <p className="mt-2 font-normal">{`${data.proposal.data.funding.amount} ${data.proposal.data.funding.token}`}</p>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">Fund Recipient</h4>
              <p className="mt-2">{data.proposal.data.funding.recipientAddress}</p>
            </div>
            <div
              className={
                !!primaryCheck
                  ? "border-b border-concrete p-6"
                  : "p-6 grow flex flex-col justify-between"
              }
            >
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase mt-4">Approval</h4>
                <div className="flex flex-row space-x-2 items-center mt-2">
                  <ProgressIndicator percent={0} twsize={6} cutoff={0} />
                  {/* todo -- approvals */}
                  <p>0/3</p>
                </div>
              </div>
            </div>
            {!!primaryCheck && (
              <div className="p-6 grow flex flex-col justify-between">
                <div className="mt-6">
                  <p className="text-xs text-concrete uppercase font-bold">Checks</p>
                  {/* {data.checks.map((c) => (
                    <> */}
                  <div className="flex justify-between items-center">
                    <AccountPfp account={primaryCheck.recipientAccount} className="mt-4" />
                    <div className="flex flex-row items-center space-x-1">
                      <span
                        className={`h-2 w-2 rounded-full bg-${
                          !!primaryCheck.txnHash ? "magic-mint" : "neon-carrot"
                        }`}
                      />
                      <div className="font-bold text-xs uppercase tracking-wider">
                        {!!primaryCheck.txnHash ? "cashed" : "pending"}
                      </div>
                      {!!primaryCheck.txnHash && (
                        <a
                          href={`${networks[primaryCheck.chainId as number].explorer}/tx/${
                            primaryCheck.txnHash
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {/* <ExternalLinkIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" /> */}
                          <LinkArrow className="fill-marble-white" />
                        </a>
                      )}
                    </div>
                  </div>
                  {/* </>
                  ))} */}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setCashCheckModalOpen(true)
              }}
              className="bg-electric-violet text-tunnel-black px-6 mb-6 rounded block mx-auto hover:bg-opacity-70"
              disabled={!primaryCheck || !!primaryCheck.txnHash}
            >
              {!primaryCheck ? "Approve" : "Cash"}
            </button>
          </div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { terminalHandle, rfpId, proposalId } = context.query as {
    terminalHandle: string
    rfpId: string
    proposalId: string
  }
  const rfp = await invoke(getRfpById, { id: rfpId })
  const proposal = await invoke(getProposalById, { id: proposalId })
  const checks = await invoke(getChecksByProposalId, { proposalId: proposal?.id as string })

  if (!rfp || !proposal) {
    return {
      redirect: {
        destination: Routes.BulletinPage({ terminalHandle }),
        permanent: false,
      },
    }
  }

  const data: GetServerSidePropsData = {
    rfp,
    proposal,
    checks,
  }

  return {
    props: { data },
  }
}

export default ProposalPage
