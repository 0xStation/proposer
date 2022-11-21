import { RfpStatus } from "@prisma/client"
import useCountdown from "app/core/hooks/useCountdown"
import { getTotalPaymentAmount, getPaymentToken } from "app/template/utils"
import { RouteUrlObject } from "blitz"
import Link from "next/link"
import React, { RefObject } from "react"
import { Rfp } from "../types"
import LookingForPill from "./LookingForPill"
import RfpStatusPill from "./RfpStatusPill"

export const RfpCard = React.forwardRef(
  ({ rfp, href }: { rfp: Rfp; href: RouteUrlObject }, ref) => {
    const timeLeft = useCountdown(rfp?.endDate)

    const RfpCardContent = ({ rfp }) => (
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
          {rfp?.endDate && rfp?.endDate > new Date() ? (
            <div>
              <h4 className="text-xs font-bold text-concrete uppercase">Ends in</h4>
              <p className="mt-2">{timeLeft}</p>
            </div>
          ) : (
            <div className="h-12" />
          )}
        </div>
        <div className="flex flex-row mt-6 justify-between">
          <span>
            {Boolean(
              getTotalPaymentAmount(rfp?.template?.data?.fields) &&
                getPaymentToken(rfp?.template?.data?.fields)?.symbol
            ) && (
              <>
                <p className="inline">{getTotalPaymentAmount(rfp?.template?.data?.fields)} </p>
                <p className="inline">{getPaymentToken(rfp?.template?.data?.fields)?.symbol}</p>
              </>
            )}
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
          <RfpCardContent rfp={rfp} />
        </div>
      </Link>
    ) : (
      <Link href={href}>
        <div className="pl-4 pr-4 pt-4 pb-4 rounded-md overflow-hidden flex flex-col justify-between bg-charcoal border border-wet-concrete hover:bg-wet-concrete cursor-pointer">
          <RfpCardContent rfp={rfp} />
        </div>
      </Link>
    )
  }
)
