import { TokenType } from "app/tag/types"
import { multicall } from "app/utils/rpcMulticall"

export type TokenDetailsResponse = {
  name: string
  symbol: string
  type: TokenType
}

export type TokenDetailsRequest = {
  chainId: number
  address: string
}

/**
 * Fetches token information provided a chain and address.
 *
 * @param req
 * @param res
 * @returns
 */
export default async function handler(req, res) {
  const params: TokenDetailsRequest = req.body

  const nameAbi = "function name() view returns (string name)"
  const symbolAbi = "function symbol() view returns (string symbol)"
  const supportsInterfaceAbi = "function supportsInterface(bytes4) view returns (bool value)"
  const abi = [nameAbi, symbolAbi, supportsInterfaceAbi]

  let name
  let symbol
  let type
  try {
    const metadata = await multicall(params.chainId.toString(), abi, [
      { targetAddress: params.address, functionSignature: "name", callParameters: [] },
      { targetAddress: params.address, functionSignature: "symbol", callParameters: [] },
    ])

    name = metadata[0]?.name
    symbol = metadata[1]?.symbol

    try {
      const tokenType = await multicall(params.chainId.toString(), abi, [
        // check 721 interfaces
        {
          targetAddress: params.address,
          functionSignature: "supportsInterface",
          callParameters: ["0x80ac58cd"], // hardcoded interfaceId for IERC721
        },
        {
          targetAddress: params.address,
          functionSignature: "supportsInterface",
          callParameters: ["0x5b5e139f"], // hardcoded interfaceId for IERC721Metadata
        },
        // check 1155 interfaces
        {
          targetAddress: params.address,
          functionSignature: "supportsInterface",
          callParameters: ["0xd9b67a26"], // hardcoded interfaceId for IERC1155
        },
        {
          targetAddress: params.address,
          functionSignature: "supportsInterface",
          callParameters: ["0x0e89341c"], // hardcoded interfaceId for IERC1155MetadataURI
        },
      ])
      type =
        tokenType[0].value || tokenType[1].value
          ? TokenType.ERC721
          : tokenType[2].value || tokenType[3].value
          ? TokenType.ERC1155
          : TokenType.ERC20
    } catch {
      // default to ERC20 otherwise
      type = TokenType.ERC20
    }
  } catch {
    res.status(404).json({ response: "failure", message: "no token found" })
    return
  }

  let data: TokenDetailsResponse = {
    name,
    symbol,
    type,
  }

  res.status(200).json({ response: "success", data })
}
