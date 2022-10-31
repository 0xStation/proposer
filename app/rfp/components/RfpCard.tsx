import { getTotalPaymentAmount, getPaymentToken } from "app/template/utils"
import Link from "next/link"
import RfpStatusPill from "./RfpStatusPill"

export const RfpCard = ({ rfp, href }) => {
  return (
    <Link href={href}>
      <div className="pl-4 pr-4 pt-4 pb-4 rounded-md overflow-hidden flex flex-col justify-between bg-charcoal border border-wet-concrete hover:bg-wet-concrete cursor-pointer">
        <div>
          <RfpStatusPill status={rfp.status} />
          <h2 className="text-xl font-bold mt-4">{rfp?.data?.content.title || ""}</h2>
        </div>
        <div className="flex flex-row mt-4 justify-between">
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
          <span>{rfp?._count.proposals || 0} proposals</span>
        </div>
      </div>
    </Link>
  )
}
