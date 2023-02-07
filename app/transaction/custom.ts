import { Interface } from "@ethersproject/abi"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

export const prepareCustomTransaction = (
  target: string,
  fn: string,
  args: any[],
  value: string
) => {
  // prepare an eth send transaction
  if (!fn && !args) {
    return {
      operation: 0,
      to: toChecksumAddress(target),
      data: "0x",
      value: value,
    }
  }

  const customCodeInterface = new Interface([fn])
  const fnName = fn.split(" ")[1]!.substring(0, fn.split(" ")[1]!.indexOf("("))
  const data = customCodeInterface.encodeFunctionData(fnName, args)

  return {
    operation: 0,
    to: toChecksumAddress(target),
    data,
    value: value,
  }
}
