import Link from "next/link"
import Image from "next/image"
import { Routes, useParam } from "@blitzjs/next"
import { RfpStatus } from "@prisma/client"
import BackIcon from "/public/back-icon.svg"
import TextLink from "app/core/components/TextLink"
import { getNetworkExplorer, getNetworkName } from "app/core/utils/networkInfo"
import { WorkspaceTab } from "pages/workspace/[accountAddress]"
import RfpStatusPill from "./RfpStatusPill"
import Button from "app/core/components/sds/buttons/Button"
import ReadMore from "app/core/components/ReadMore"
import { toTitleCase } from "app/core/utils/titleCase"
import { getPaymentAmountDetails, paymentDetailsString } from "../utils"
import { paymentTermsString } from "app/proposal/utils"
import LookingForPill from "./LookingForPill"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import RfpSchedule from "./metadata/RfpSchedule"
import RfpReward from "./metadata/RfpReward"
import { invalidateQuery, useQuery } from "@blitzjs/rpc"
import getRfpById from "../queries/getRfpById"
import { useRouter } from "next/router"
import { useScheduleCallback } from "app/core/hooks/useScheduleCallback"

export const RfpSidebar = () => {
  const rfpId = useParam("rfpId") as string

  const [rfp] = useQuery(
    getRfpById,
    { id: rfpId },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      enabled: Boolean(rfpId),
      staleTime: 500,
    }
  )
  const { type: paymentAmountType, amount: paymentAmount } = getPaymentAmountDetails(
    rfp?.data?.proposal?.payment?.minAmount,
    rfp?.data?.proposal?.payment?.maxAmount
  )

  useScheduleCallback({ callback: () => invalidateQuery(getRfpById), date: rfp?.startDate })
  useScheduleCallback({ callback: () => invalidateQuery(getRfpById), date: rfp?.endDate })
  const router = useRouter()

  return (
    <div className="h-full w-[380px] overflow-y-scroll p-6 border-r border-concrete">
      <div className="flex flex-col pb-6 space-y-6">
        <nav>
          <Link
            href={Routes.WorkspaceHome({
              accountAddress: rfp?.accountAddress as string,
              tab: WorkspaceTab.RFPS,
            })}
          >
            <span className="text-concrete cursor-pointer hover:text-concrete">RFPs</span>
          </Link>

          <span className="text-concrete">&nbsp;/&nbsp;</span>
          {rfp?.data?.content?.title ? (
            router.pathname === Routes.RfpDetail({ rfpId }).pathname ? (
              <span className="text-marble-white cursor-default">{rfp?.data?.content?.title}</span>
            ) : (
              <Link href={Routes.RfpDetail({ rfpId: rfp?.id as string })}>
                <span className="text-marble-white cursor-pointer hover:text-concrete">
                  {rfp?.data?.content?.title}
                </span>
              </Link>
            )
          ) : (
            <span className="h-5 w-36 rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
          )}
        </nav>
        {/* PILLS */}
        {rfp ? (
          <div className="flex flex-row flex-wrap gap-1">
            <RfpStatusPill status={rfp?.status} />
            {rfp?.status !== RfpStatus.CLOSED && (
              <LookingForPill role={rfp?.data?.proposal?.proposerRole} />
            )}
          </div>
        ) : (
          // LOADING STATE
          <div
            tabIndex={0}
            className={`h-6 w-full rounded-xl flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
          />
        )}
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
        <RfpReward rfpProposalPayment={rfp?.data?.proposal?.payment} />
        <RfpSchedule status={rfp?.status} startDate={rfp?.startDate} endDate={rfp?.endDate} />
        {/* CTA */}
        <div className="mb-10 relative group">
          {/* Hide "Propose" button when showing the proposal creation form  */}
          {router.pathname !== Routes.ProposalRfpForm({ rfpId }).pathname && (
            <Button
              onClick={() =>
                router.push(
                  Routes.ProposalRfpForm({
                    rfpId: rfp?.id as string,
                  })
                )
              }
              className="w-full"
              isDisabled={rfp?.status === RfpStatus.CLOSED}
            >
              Propose
            </Button>
          )}
          {rfp?.status === RfpStatus.CLOSED && (
            <div className="absolute group-hover:block hidden text-xs text-marble-white bg-wet-concrete rounded p-3 mt-2 -mb-5">
              This RFP is currently not accepting submissions.
            </div>
          )}
        </div>
        {/* METADATA */}
        <div className="pt-6 flex flex-col space-y-6">
          {/* ACCOUNT */}
          {rfp?.account && (
            <div>
              <h4 className="text-xs font-bold text-concrete uppercase mb-2">
                {rfp?.data?.proposal?.requesterRole}
              </h4>
              <AccountMediaObject account={rfp?.account} />
            </div>
          )}
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
            (typeof rfp?.data?.proposal?.body?.minWordCount === "number" &&
              rfp?.data?.proposal?.body?.minWordCount > 0)) && (
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
              {typeof rfp?.data?.proposal?.body?.minWordCount === "number" &&
                rfp?.data?.proposal?.body?.minWordCount > 0 && (
                  <p className="mt-2">
                    {rfp?.data?.proposal?.body?.minWordCount + " word minimum"}
                  </p>
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
              {/* PAYMENT TERMS */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Payment terms</h4>
                <p className="mt-2">
                  {paymentTermsString(
                    rfp?.data?.proposal?.payment?.terms,
                    rfp?.data?.proposal?.payment?.advancePaymentPercentage
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
