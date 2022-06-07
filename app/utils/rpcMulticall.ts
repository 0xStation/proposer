import { Interface } from "@ethersproject/abi"
import { Contract } from "@ethersproject/contracts"
import { AlchemyProvider } from "@ethersproject/providers"
// trimmed version from snapshot here: https://github.com/snapshot-labs/snapshot.js/blob/master/src/networks.json
import networks from "./networks.json"
import { requireEnv } from "./requireEnv"

export type AtomicCall = {
  targetAddress: string
  functionSignature: string
  callParameters: any[]
}

// forked from snapshot here: https://github.com/snapshot-labs/snapshot.js/blob/master/src/utils.ts#L46-L86
export async function multicall(chainId: string, abi: string[], calls: AtomicCall[], options?) {
  // abi for making multiple view calls in one RPC call
  const multicallAbi = [
    "function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)",
  ]

  // node provider for making calls to smart contracts
  const provider = new AlchemyProvider(networks[chainId].network, requireEnv("ALCHEMY_API_KEY"))
  // multicall contract object
  const multi = new Contract(
    networks[chainId].multicall, // address of multicall contract on specific chain
    multicallAbi,
    provider
  )
  // interface object for abi to multicall
  const itf = new Interface(abi)
  try {
    // split `calls` into multiple pages of `max` length each
    const max = options?.limit || 500
    const pages = Math.ceil(calls.length / max)
    const promises: any = []
    Array.from(Array(pages)).forEach((x, i) => {
      // take the `calls` for this page via a slice
      const callsInPage = calls.slice(max * i, max * (i + 1))
      // convert `callsInPage` to one `aggregate` call to make to the multicall contract
      promises.push(
        multi.aggregate(
          callsInPage.map((call) => [
            // grab the target address and lowercase it
            call.targetAddress.toLowerCase(),
            // encode the function signature with calldata e.g. ownerOf(uint256 tokenId) & 1234
            itf.encodeFunctionData(call.functionSignature, call.callParameters),
          ]),
          options || {}
        )
      )
    })
    // await for all paginated queries to complete
    let results: any = await Promise.all(promises)
    // reduce paginated results into one flat array
    results = results.reduce((prev: any, [, res]: any) => prev.concat(res), [])
    // tage each call's result, and parse the return value, preserving order
    return results.map((call, i) =>
      itf.decodeFunctionResult(calls[i]?.functionSignature as string, call)
    )
  } catch (e) {
    return Promise.reject(e)
  }
}