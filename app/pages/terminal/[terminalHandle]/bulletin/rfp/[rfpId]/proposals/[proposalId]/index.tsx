import {
  BlitzPage,
  Routes,
  useParam,
  Link,
  invoke,
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import Preview from "app/core/components/MarkdownPreview"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
import getProposalById from "app/proposal/queries/getProposalById"
import { Rfp } from "app/rfp/types"
import { Proposal } from "app/proposal/types"
import { PROPOSAL_STATUS_DISPLAY_MAP } from "app/core/utils/constants"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"

type GetServerSidePropsData = {
  rfp: Rfp
  proposal: Proposal
}

const ProgressIndicator = ({ percent, twsize, cutoff }) => {
  const size = twsize * 4
  const MAX_CIRCUMFRANCE = 2 * (size / 2 - size / 10) * Math.PI * ((360 - cutoff) / 360)
  const strokeDashoffset = MAX_CIRCUMFRANCE - MAX_CIRCUMFRANCE * percent

  return (
    <div className={`w-${twsize} h-${twsize} relative`}>
      {/* base layer */}
      <svg width={`${size}px`} height={`${size}px`} className="absolute top-0 left-0">
        <circle
          cx={`${size / 2}`}
          cy={`${size / 2}`}
          r={`${size / 2 - size / 10}`}
          stroke="#646464"
          strokeWidth={`${size / 10}`}
          strokeDasharray={MAX_CIRCUMFRANCE}
          strokeDashoffset="0"
          transform={`rotate(${90 + cutoff / 2}, ${size / 2}, ${size / 2})`}
        />
      </svg>

      <svg width={`${size}px`} height={`${size}px`} className="absolute top-0 left-0">
        <circle
          cx={`${size / 2}`}
          cy={`${size / 2}`}
          r={`${size / 2 - size / 10}`}
          // strokeLinecap="round"
          stroke="#63EBAF"
          fill="none"
          strokeWidth={`${size / 10}`}
          strokeDasharray={MAX_CIRCUMFRANCE}
          strokeDashoffset={!isNaN(strokeDashoffset) ? strokeDashoffset : 0}
          transform={`rotate(${90 + cutoff / 2}, ${size / 2}, ${size / 2})`}
        />
      </svg>
    </div>
  )
}

const ProposalPage: BlitzPage = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const terminalHandle = useParam("terminalHandle") as string
  return (
    <Layout title={`Proposals`}>
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
                </Link>
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
              <p className="mt-2 text-electric-violet">{data.rfp.data.content.title}</p>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">Total Amount</h4>
              <p className="mt-2 font-normal">{`${data.proposal.data.funding.amount} ${data.proposal.data.funding.token}`}</p>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">Fund Recipient</h4>
              <p className="mt-2">{data.proposal.data.funding.recipientAddress}</p>
            </div>
            <div className="p-6 grow flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase mt-4">Approval</h4>
                <div className="flex flex-row space-x-2 items-center mt-2">
                  <ProgressIndicator percent={0} twsize={6} cutoff={0} />
                  <p className="">0/3</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  //
                }}
                className={`bg-electric-violet text-tunnel-black px-6 py-1 rounded block mx-auto hover:bg-opacity-70`}
              >
                Approve
              </button>
            </div>
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
  }

  return {
    props: { data },
  }
}

export default ProposalPage
