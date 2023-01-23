import PreviewEditor from "app/core/components/MarkdownPreview"
import MetadataItem from "app/core/components/MetadataItem"
import { Check, CheckType } from "../types"
import { FungibleTransferDetails } from "./FungibleTransferDetails"
import { NonFungibleTransferDetails } from "./NonFungibleTransferDetails"

export const CheckDetails = ({ check, className = "" }: { check?: Check; className?: string }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <MetadataItem label="note">
        <PreviewEditor markdown={check?.data.title} />
      </MetadataItem>
      {check?.data.meta.type === CheckType.FungibleTransfer ? (
        <MetadataItem label="execution">
          <FungibleTransferDetails
            sender={check?.address}
            recipient={check?.data.meta.recipient!}
            token={check?.data.meta.token!}
            amount={check?.data.meta.amount!}
          />
        </MetadataItem>
      ) : check?.data.meta.type === CheckType.NonFungibleTransfer ? (
        <MetadataItem label="execution">
          <NonFungibleTransferDetails
            sender={check.address}
            recipient={check.data.meta.recipient!}
            token={check.data.meta.token}
          />
        </MetadataItem>
      ) : (
        <></>
      )}
    </div>
  )
}
