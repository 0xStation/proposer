import { Interface } from "@ethersproject/abi"
import { Contract } from "@ethersproject/contracts"
// trimmed version from snapshot here: https://github.com/snapshot-labs/snapshot.js/blob/master/src/networks.json
import networks from "./networks.json"

// forked from snapshot here: https://github.com/snapshot-labs/snapshot.js/blob/master/src/utils.ts#L46-L86
export async function multicall(network: string, provider, abi: any[], calls: any[], options?) {
  const multicallAbi = [
    "function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)",
  ]
  const multi = new Contract(
    networks[network].multicall, // address of multicall contract on network
    multicallAbi, // abi for making multiple view calls in one RPC call
    provider // node provider object e.g. Alchemy, Infura
  )
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
            call[0].toLowerCase(),
            // encode the function signature with calldata e.g. ownerOf(uint256 tokenId) & 1234
            itf.encodeFunctionData(call[1], call[2]),
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
    return results.map((call, i) => itf.decodeFunctionResult(calls[i][1], call))
  } catch (e) {
    return Promise.reject(e)
  }
}
