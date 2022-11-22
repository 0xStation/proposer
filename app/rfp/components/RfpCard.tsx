import { RfpStatus } from "@prisma/client"
import useCountdown from "app/core/hooks/useCountdown"
import { getTotalPaymentAmount, getPaymentToken } from "app/template/utils"
import { RouteUrlObject } from "blitz"
import Link from "next/link"
import React, { RefObject } from "react"
import { Rfp } from "../types"
import RfpEndsIn from "./metadata/RfpEndsIn"
import LookingForPill from "./LookingForPill"
import RfpStatusPill from "./RfpStatusPill"
import RfpReward from "./metadata/RfpReward"
import AccountMediaRow from "app/comment/components/AccountMediaRow"
import { Account } from "app/account/types"

export const RfpCard = React.forwardRef(
  ({ account, rfp, href }: { account: Account; rfp: Rfp; href: RouteUrlObject }, ref) => {
    const RfpCardContent = ({ account, rfp }) => (
      <>
        <div>
          {/* STATUS PILLS */}
          <div className="flex flex-row flex-wrap gap-1">
            <RfpStatusPill status={rfp?.status} />
            {rfp?.status !== RfpStatus.CLOSED && (
              <LookingForPill role={rfp?.data?.proposal?.proposerRole} />
            )}
          </div>
          {/* TITLE */}
          <h2 className="text-xl font-bold mt-4">{rfp?.data?.content.title || ""}</h2>
        </div>
        <div className="mt-6 flex flex-col space-y-4 h-[120px]">
          <RfpReward rfpProposalPayment={rfp?.data?.proposal?.payment} />
          <RfpEndsIn status={rfp?.status} endDate={rfp?.endDate} />
        </div>
        <div className="flex flex-row mt-6 justify-between">
          <span>
            <AccountMediaRow account={account} hideName={true} />
          </span>
          <span>{rfp?._count?.proposals || 0} proposals</span>
        </div>
      </>
    )
    return ref ? (
      <Link href={href}>
        <div
          ref={ref as RefObject<HTMLDivElement>}
          className="pl-4 pr-4 pt-4 pb-4 rounded-md overflow-hidden flex flex-col justify-between bg-charcoal border border-wet-concrete hover:bg-wet-concrete cursor-pointer"
        >
          <RfpCardContent account={account} rfp={rfp} />
        </div>
      </Link>
    ) : (
      <Link href={href}>
        <div className="pl-4 pr-4 pt-4 pb-4 rounded-md overflow-hidden flex flex-col justify-between bg-charcoal border border-wet-concrete hover:bg-wet-concrete cursor-pointer">
          <RfpCardContent account={account} rfp={rfp} />
        </div>
      </Link>
    )
  }
)
