import { Interface } from "@ethersproject/abi"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

export const prepareAddSignerWithThresholdTransaction = (
  safeAddress,
  newSignerAddress,
  threshold: number
) => {
  const changeThresholdInterface = new Interface([
    "function addOwnerWithThreshold(address owner, uint256 _threshold)",
  ])

  const data = changeThresholdInterface.encodeFunctionData("addOwnerWithThreshold", [
    newSignerAddress,
    threshold,
  ])

  return {
    to: toChecksumAddress(safeAddress),
    value: "0",
    data,
  }
}
