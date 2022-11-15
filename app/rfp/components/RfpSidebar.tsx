import Link from "next/link"
import Image from "next/image"
import { useQuery } from "@blitzjs/rpc"
import { Routes, useParam } from "@blitzjs/next"
import { RfpStatus } from "@prisma/client"
import BackIcon from "/public/back-icon.svg"
import TextLink from "app/core/components/TextLink"
import { getNetworkExplorer, getNetworkName } from "app/core/utils/networkInfo"
import { WorkspaceTab } from "pages/workspace/[accountAddress]"
import RfpStatusPill from "./RfpStatusPill"
import Button from "app/core/components/sds/buttons/Button"
import ReadMore from "app/core/components/ReadMore"
import getTemplateByRfpId from "app/template/queries/getTemplateByRfpId"
import { toTitleCase } from "app/core/utils/titleCase"

export const RfpSidebar = ({ rfp }) => {
  const [template] = useQuery(
    getTemplateByRfpId,
    { rfpId: rfp?.id as string },
    {
      suspense: false,
      enabled: Boolean(rfp?.id),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )
  return (
    <div className="h-full w-[288px] overflow-y-scroll p-6 border-r border-concrete">
      <div className="flex flex-col pb-6 space-y-6">
        {/* BACK */}
        <Link
          href={Routes.WorkspaceHome({
            accountAddress: rfp?.accountAddress as string,
            tab: WorkspaceTab.RFPS,
          })}
        >
          <div className="h-[16px] w-[16px] cursor-pointer">
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
        {/* CTA */}
        <div className="mb-10 relative group">
          <Link
            href={Routes.ProposalRfpForm({
              templateId: rfp?.id as string,
            })}
          >
            <Button className="w-full" isDisabled={rfp?.status === RfpStatus.CLOSED}>
              Propose
            </Button>
          </Link>
          {rfp?.status === RfpStatus.CLOSED && (
            <div className="absolute group-hover:block hidden text-xs text-marble-white bg-wet-concrete rounded p-3 mt-2 -mb-5">
              This RFP is currently not accepting submissions.
            </div>
          )}
        </div>
        {/* METADATA */}
        <div className="pt-6 flex flex-col space-y-6">
          {/* SUBMISSION GUIDELINES */}
          {!!rfp?.data?.content.body && (
            <div>
              <h4 className="text-xs font-bold text-concrete uppercase">Submission guidelines</h4>
              <ReadMore className="mt-2" maxCharLength={75}>
                {rfp?.data?.content.body}
              </ReadMore>
            </div>
          )}
          {/* REQUIREMENTS */}
          {(!!rfp?.data?.singleTokenGate ||
            !!rfp?.data?.requiredSocialConnections?.length ||
            rfp?.data?.proposal?.body?.minWordCount > 0) && (
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
              {rfp?.data?.proposal?.body?.minWordCount > 0 && (
                <p className="mt-2">{rfp?.data?.proposal?.body?.minWordCount + " word minimum"}</p>
              )}
            </div>
          )}
          {rfp?.data?.proposal?.payment?.token && (
            <>
              {/* NETWORK */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Network</h4>
                <p className="mt-2">
                  {getNetworkName(rfp?.data?.proposal?.payment?.token?.chainId)}
                </p>
              </div>
              {/* PAYMENT TOKEN */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Payment token</h4>
                <p className="mt-2">{rfp?.data?.proposal?.payment?.token?.symbol}</p>
              </div>
              {/* PAYMENT AMOUNT */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Payment amount</h4>
                <p className="mt-2">{rfp?.data?.proposal?.payment?.amount}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
