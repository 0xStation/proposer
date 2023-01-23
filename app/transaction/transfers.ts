import { Interface } from "@ethersproject/abi"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

export const prepareERC721TransferTransaction = (
  senderAddress: string,
  recipientAddress: string,
  collectionAddress: string,
  tokenId: number
) => {
  let target
  let value
  let data

  target = collectionAddress
  value = 0

  const erc721SafeTransferInterface = new Interface([
    "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  ])

  data = erc721SafeTransferInterface.encodeFunctionData("safeTransferFrom", [
    senderAddress,
    recipientAddress,
    tokenId,
  ])

  return {
    to: toChecksumAddress(target),
    value,
    data,
  }
}
