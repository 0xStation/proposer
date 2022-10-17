import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import networks from "app/utils/networks.json"
import { AlchemyProvider } from "@ethersproject/providers"
import { Contract } from "@ethersproject/contracts"
import { requireEnv } from "app/utils/requireEnv"
import { BigNumber } from "ethers"

const GetAccountHasToken = z.object({
  chainId: z.number(),
  tokenAddress: z.string(),
  accountAddress: z.string(),
  minBalance: z.string(),
})

// Designed to only support ERC20 and ERC721 tokens right now
// TODO: add ERC1155 support
export default async function getAccountHasToken(input: z.infer<typeof GetAccountHasToken>) {
  const params = GetAccountHasToken.parse(input)

  // node provider for making calls to smart contracts
  const provider = new AlchemyProvider(
    networks[params.chainId.toString()].network,
    requireEnv("ALCHEMY_API_KEY")
  )
  // abi for a token's balance
  const abi = ["function balanceOf(address account) view returns (uint256)"]
  // contract object
  const contract = new Contract(params.tokenAddress, abi, provider)

  try {
    // res has return values as array in-order, balanceOf is first (and only) value
    const [balance] = await contract.functions.balanceOf!(params.accountAddress)
    console.log(balance)
    return (balance as BigNumber).gte(BigNumber.from(params.minBalance))
  } catch (e) {
    console.log(e)
    return Promise.reject(e)
  }
}
