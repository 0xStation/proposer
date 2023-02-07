import { Interface } from "@ethersproject/abi"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

export const prepareRemoveSignerTransaction = (
  safeAddress,
  prevSignerAddress,
  oldSignerAddress,
  threshold
) => {
  const changeThresholdInterface = new Interface([
    "function removeOwner(address prevOwner, address owner, uint256 _threshold)",
  ])

  const data = changeThresholdInterface.encodeFunctionData("removeOwner", [
    prevSignerAddress,
    oldSignerAddress,
    threshold,
  ])

  return {
    to: toChecksumAddress(safeAddress),
    value: "0",
    data,
  }
}
