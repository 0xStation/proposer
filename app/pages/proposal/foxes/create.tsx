import { BlitzPage, Image, Link, Routes, useQuery, useRouterQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import FoxesProposalForm from "app/proposalForm/components/foxes/form"
import getRfpById from "app/rfp/queries/getRfpById"
import BackIcon from "/public/back-icon.svg"
import { getNetworkExplorer, getNetworkName } from "app/core/utils/networkInfo"
import { getPaymentAmount, getPaymentToken } from "app/template/utils"
import RfpStatusPill from "app/rfp/components/RfpStatusPill"
import ReadMore from "app/core/components/ReadMore"
import TextLink from "app/core/components/TextLink"

const CreateFoxesProposal: BlitzPage = () => {
  const queryParams = useRouterQuery()
  const rfpId = queryParams?.rfpId as string
  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )

  return (
    <Layout title="New Proposal">
      {/* LEFT SIDEBAR | PROPOSAL FORM */}
      <div className="flex flex-row h-full">
        {/* LEFT SIDEBAR */}
        <div className="h-full w-[288px] overflow-y-scroll border-r border-concrete p-6">
          <div className="flex flex-col pb-6 space-y-6">
            {/* BACK */}
            <Link href={Routes.RfpDetail({ rfpId })}>
              <div className="h-[16px] w-[16px]">
                <Image src={BackIcon} alt="Back icon" />
              </div>
            </Link>
            {/* TITLE */}
            {rfp ? (
              <span className="mt-6 text-2xl font-bold text-marble-white">
                {rfp?.data.content.title}
              </span>
            ) : (
              // LOADING STATE
              <div
                tabIndex={0}
                className={`h-8 w-full rounded-lg flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
              />
            )}
            {/* STATUS PILL */}
            {rfp ? (
              <RfpStatusPill status={rfp?.status} />
            ) : (
              // LOADING STATE
              <div
                tabIndex={0}
                className={`h-6 w-1/3 rounded-xl flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
              />
            )}
            {/* METADATA */}
            <div className="mt-12 pt-6 flex flex-col space-y-6">
              {/* SUBMISSION GUIDELINES */}
              {rfp?.data?.content.submissionGuideline && (
                <div>
                  <h4 className="text-xs font-bold text-concrete uppercase">
                    Submission guidelines
                  </h4>
                  <ReadMore maxCharLength={75}>{rfp?.data?.content.submissionGuideline}</ReadMore>
                </div>
              )}
              {/* SUBMISSION REQUIREMENT */}
              {!!rfp?.data?.singleTokenGate && (
                <div>
                  <h4 className="text-xs font-bold text-concrete uppercase">
                    Submission requirement
                  </h4>
                  <div>
                    {`At least ${rfp?.data?.singleTokenGate.minBalance || 1} `}
                    <TextLink
                      url={
                        getNetworkExplorer(rfp?.data?.singleTokenGate.token.chainId) +
                        "/token/" +
                        rfp?.data?.singleTokenGate.token.address
                      }
                    >
                      {rfp?.data?.singleTokenGate.token.name}
                    </TextLink>
                  </div>
                </div>
              )}
              {/* NETWORK */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Network</h4>
                <p className="mt-2">
                  {getNetworkName(getPaymentToken(rfp?.data.template)?.chainId)}
                </p>
              </div>
              {/* PAYMENT TOKEN */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Payment token</h4>
                <p className="mt-2">{getPaymentToken(rfp?.data.template)?.symbol}</p>
              </div>
              {/* PAYMENT AMOUNT */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Payment amount</h4>
                <p className="mt-2">{getPaymentAmount(rfp?.data.template)}</p>
              </div>
            </div>
          </div>
        </div>
        <FoxesProposalForm />
      </div>
    </Layout>
  )
}

CreateFoxesProposal.suppressFirstRenderFlicker = true

export default CreateFoxesProposal
