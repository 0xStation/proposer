import { Interface } from "@ethersproject/abi"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

export const prepareReplaceSignerTransaction = (
  safeAddress,
  prevSignerAddress,
  oldSignerAddress,
  newSignerAddress
) => {
  const changeThresholdInterface = new Interface([
    "function swapOwner(address prevOwner, address oldOwner, address newOwner)",
  ])

  const data = changeThresholdInterface.encodeFunctionData("swapOwner", [
    prevSignerAddress,
    oldSignerAddress,
    newSignerAddress,
  ])

  return {
    to: toChecksumAddress(safeAddress),
    value: "0",
    data,
  }
}
