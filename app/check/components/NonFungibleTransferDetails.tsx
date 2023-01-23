import MetadataItem from "app/core/components/MetadataItem"
import { getNetworkNftUrl } from "app/core/utils/networkInfo"
import { Token } from "app/token/types"

export const NonFungibleTransferDetails = ({
  sender,
  recipient,
  token,
}: {
  sender: string
  recipient: string
  token: any
}) => {
  console.log("token", token)
  return (
    <div className="p-6 bg-charcoal rounded-xl space-y-6">
      <p className="font-bold">NFT transfer</p>
      <MetadataItem label="sender">
        <p>{sender}</p>
      </MetadataItem>
      <MetadataItem label="recipient">
        <p>{recipient}</p>
      </MetadataItem>
      <MetadataItem label="token">
        <div className="grid grid-cols-4 gap-4 mt-4">
          <a
            href={getNetworkNftUrl(token.chainId, token.address, token.tokenId)}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 p-2 rounded bg-wet-concrete"
          >
            <img src={token.imageUrl} />
            <p className="text-xs mt-2">{`${token.name} #${token.tokenId}`}</p>
          </a>
        </div>
      </MetadataItem>
    </div>
  )
}
