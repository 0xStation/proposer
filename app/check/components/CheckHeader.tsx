import { Routes } from "@blitzjs/next"
import { LinkIcon } from "@heroicons/react/outline"
import CopyToClipboard from "app/core/components/CopyToClipboard"
import MetadataItem from "app/core/components/MetadataItem"
import SeeTransaction from "app/core/components/SeeTransaction"
import { formatDate } from "app/core/utils/formatDate"
import { genUrlFromRoute } from "app/utils/genUrlFromRoute"
import useCheckStatus from "../hooks/useCheckStatus"
import { Check, CheckStatus } from "../types"
import { CheckStatusIndicator } from "./CheckStatusIndicator"

export const CheckHeader = ({ check, className = "" }: { check?: Check; className?: string }) => {
  const { status } = useCheckStatus({ check })
  const url =
    typeof window !== "undefined"
      ? window?.location?.host +
        genUrlFromRoute(Routes.ViewRequest({ requestId: check?.id as string }))
      : ""

  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row space-x-6 items-center">
        <span className="text-concrete uppercase">#{check?.nonce}</span>
        <p className="text-concrete">{formatDate(check?.createdAt)}</p>
        <div className="flex flex-row space-x-4 items-center">
          <CheckStatusIndicator check={check} />
          {status === CheckStatus.EXECUTED && (
            <SeeTransaction chainId={check?.chainId} txnHash={check?.txnHash} />
          )}
        </div>
      </div>
      <CopyToClipboard text={url} />
    </div>
  )
}
