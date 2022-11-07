import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { useQuery } from "@blitzjs/rpc"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import ProposalFormTemplate from "app/proposalForm/components/template/form"
import BackIcon from "/public/back-icon.svg"
import { getNetworkExplorer, getNetworkName } from "app/core/utils/networkInfo"
import {
  getMinNumWords,
  getPaymentAmount,
  getPayments,
  getPaymentToken,
  getTotalPaymentAmount,
} from "app/template/utils"
import RfpStatusPill from "app/rfp/components/RfpStatusPill"
import ReadMore from "app/core/components/ReadMore"
import TextLink from "app/core/components/TextLink"
import getTemplateById from "app/template/queries/getTemplateById"
import getRfpById from "app/rfp/queries/getRfpById"
import { toTitleCase } from "app/core/utils/titleCase"

const ProposalTemplateForm: BlitzPage = () => {
  const templateId = useParam("templateId") as string
  const { rfpId } = useRouter().query
  const router = useRouter()
  const [template] = useQuery(
    getTemplateById,
    {
      id: templateId,
    },
    {
      enabled: !!templateId,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )
  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId as string,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (!data) {
          router.push(Routes.Page404())
        }
      },
      onError: (data) => {
        if (!data) {
          router.push(Routes.Page404())
        }
      },
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
            <Link href={Routes.RfpDetail({ rfpId: rfp?.id as string })}>
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
              {!!rfp?.data?.content.body && (
                <div>
                  <h4 className="text-xs font-bold text-concrete uppercase">
                    Submission guidelines
                  </h4>
                  <ReadMore className="mt-2" maxCharLength={75}>
                    {rfp?.data?.content.body}
                  </ReadMore>
                </div>
              )}
              {/* REQUIREMENTS */}
              {(!!rfp?.data?.singleTokenGate ||
                !!rfp?.data?.requiredSocialConnections ||
                getMinNumWords(template?.data?.fields) > 0) && (
                <div>
                  <h4 className="text-xs font-bold text-concrete uppercase">Requirements</h4>
                  {!!rfp?.data?.singleTokenGate && (
                    <p className="mt-2">
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
                    </p>
                  )}
                  {!!rfp?.data?.requiredSocialConnections &&
                    rfp?.data?.requiredSocialConnections.map((social, idx) => (
                      <p className="mt-2" key={idx}>
                        {toTitleCase(social)} connection
                      </p>
                    ))}
                  {getMinNumWords(template?.data?.fields) > 0 && (
                    <p className="mt-2">
                      {getMinNumWords(template?.data?.fields) + " word minimum"}
                    </p>
                  )}
                </div>
              )}
              {getPayments(template?.data.fields)?.length > 0 && (
                <>
                  {/* NETWORK */}
                  <div>
                    <h4 className="text-xs font-bold text-concrete uppercase">Network</h4>
                    <p className="mt-2">
                      {getNetworkName(getPaymentToken(template?.data?.fields)?.chainId)}
                    </p>
                  </div>
                  {/* PAYMENT TOKEN */}
                  <div>
                    <h4 className="text-xs font-bold text-concrete uppercase">Payment token</h4>
                    <p className="mt-2">{getPaymentToken(template?.data?.fields)?.symbol}</p>
                  </div>
                  {/* PAYMENT AMOUNT */}
                  <div>
                    <h4 className="text-xs font-bold text-concrete uppercase">Payment amount</h4>
                    <p className="mt-2">{getTotalPaymentAmount(template?.data?.fields)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <ProposalFormTemplate />
      </div>
    </Layout>
  )
}

ProposalTemplateForm.suppressFirstRenderFlicker = true

export default ProposalTemplateForm
