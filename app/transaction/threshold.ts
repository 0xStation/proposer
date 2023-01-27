import { Interface } from "@ethersproject/abi"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

export const prepareChangeThresholdTransaction = (safeAddress, threshold: number) => {
  const changeThresholdInterface = new Interface(["function changeThreshold(uint256 _threshold)"])

  const data = changeThresholdInterface.encodeFunctionData("changeThreshold", [threshold])

  return {
    to: toChecksumAddress(safeAddress),
    value: "0",
    data,
  }
}
