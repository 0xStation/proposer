import { AlchemyProvider } from "@ethersproject/providers"
import { Contract } from "@ethersproject/contracts"
import networks from "./networks.json"
import { requireEnv } from "./requireEnv"

// forked from snapshot here: https://github.com/snapshot-labs/snapshot.js/blob/master/src/utils.ts#L46-L86
export async function fetchTokenDecimals(chainId: number, address: string) {
  // node provider for making calls to smart contracts
  const provider = new AlchemyProvider(
    networks[chainId.toString()].network,
    requireEnv("BLITZ_PUBLIC_ALCHEMY_API_KEY")
  )
  // abi for a token's decimals
  const abi = ["function decimals() view returns (uint8)"]
  // contract object
  const contract = new Contract(address, abi, provider)

  try {
    const res = await contract.functions.decimals!()
    // res has return values as array in-order, decimals is first (and only) value
    return res[0]
  } catch (e) {
    return Promise.reject(e)
  }
}
