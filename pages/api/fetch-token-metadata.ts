import { api } from "app/blitz-server"
import * as z from "zod"
import { multicall } from "app/utils/rpcMulticall"
import { TokenType } from "@prisma/client"

export type TokenMetadataResponse = {
  type: TokenType
  name: string
  symbol?: string
  decimals?: number
}

const TokenMetadataRequest = z.object({
  chainId: z.number(),
  address: z.string(),
})

/**
 * Fetches token information provided a chain and address.
 *
 * @param req
 * @param res
 * @returns token metadata object on success or failure message if no token exists
 */
export default api(async function handler(req, res) {
  let params
  try {
    params = TokenMetadataRequest.parse(req.body)
  } catch (e) {
    console.log(e)
    res.status(500).json({ response: "error", message: "missing required parameter" })
  }

  // Fetchable data:
  // ERC20:
  //   - name
  //   - symbol
  //   - decimals
  // ERC721:
  //   - name
  //   - symbol
  //   - supportsInterface -> returns true if provide a unique bytes4 that represents the ERC721 id
  // ERC1155:
  //   - supportsInterface -> returns true if provide a unique bytes4 that represents the ERC1155 id
  const nameAbi = "function name() view returns (string name)"
  const symbolAbi = "function symbol() view returns (string symbol)"
  const decimalsAbi = "function decimals() view returns (uint8 decimals)"
  const supportsInterfaceAbi = "function supportsInterface(bytes4) view returns (bool value)"
  const abi = [nameAbi, symbolAbi, decimalsAbi, supportsInterfaceAbi]

  let name
  let symbol
  let decimals
  let type
  try {
    const metadata = await multicall(params.chainId.toString(), abi, [
      { targetAddress: params.address, functionSignature: "name", callParameters: [] },
      { targetAddress: params.address, functionSignature: "symbol", callParameters: [] },
    ])

    name = metadata[0]?.name
    symbol = metadata[1]?.symbol

    try {
      const decimalsRequest = await multicall(params.chainId.toString(), abi, [
        { targetAddress: params.address, functionSignature: "decimals", callParameters: [] },
      ])
      decimals = decimalsRequest[0]?.decimals
    } catch (e) {
      console.warn(e)
      // no decimals found on token, silently fail because its not an ERC20
      // so move on to next function call
    }

    if (decimals) {
      // address is an ERC20, return early
      return res.status(200).json({
        response: "success",
        data: {
          name,
          symbol,
          decimals,
          type: TokenType.ERC20,
        } as TokenMetadataResponse,
      })
    }

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
    } catch (err) {
      // token is not ERC721 or ERC1155
      console.error(err)
      throw Error("No token found.")
    }
  } catch (e) {
    res.status(404).json({ response: "failure", message: "No token found." })
    return
  }

  let data: TokenMetadataResponse = {
    type,
    name,
    symbol,
    decimals,
  }

  res.status(200).json({ response: "success", data })
})
