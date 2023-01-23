import { Interface } from "@ethersproject/abi"
import { CHECKBOOK_MODULE_ADDRESS } from "app/core/utils/constants"
import { genGnosisTransactionDigest } from "app/signatures/gnosisTransaction"

export const genAddCheckbookDigest = (chainId, address, nonce, contractVersion) => {
  const to = address
  const value = "0"

  const safeInterface = new Interface(["function enableModule(address module)"])
  const data = safeInterface.encodeFunctionData("enableModule", [CHECKBOOK_MODULE_ADDRESS[chainId]])

  return genGnosisTransactionDigest(chainId, address, to, value, data, nonce, contractVersion)
}
