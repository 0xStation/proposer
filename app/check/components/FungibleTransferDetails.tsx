import MetadataItem from "app/core/components/MetadataItem"
import { Token } from "app/token/types"

export const FungibleTransferDetails = ({
  sender,
  recipient,
  token,
  amount,
}: {
  sender: string
  recipient: string
  token: Token
  amount: string
}) => {
  return (
    <div className="p-6 bg-charcoal rounded-xl space-y-6">
      <p className="font-bold">Fungible token transfer</p>
      <MetadataItem label="sender">
        <p>{sender}</p>
      </MetadataItem>
      <MetadataItem label="recipient">
        <p>{recipient}</p>
      </MetadataItem>
      <MetadataItem label="token">
        <p>{token.symbol}</p>
      </MetadataItem>
      <MetadataItem label="amount">
        <p>{amount}</p>
      </MetadataItem>
    </div>
  )
}
