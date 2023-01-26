import { Interface } from "@ethersproject/abi"
import { CHECKBOOK_MODULE_ADDRESS, ZERO_ADDRESS } from "app/core/utils/constants"
import { BigNumber } from "@ethersproject/bignumber"

export const checkbookTransaction = ({
  checkTitle,
  chainId,
  safe,
  nonce,
  to,
  value,
  data,
  proofs,
}) => {
  const checkbookInterface = new Interface([
    "function execute(address safe,uint256 nonce,address executor,address to,uint256 value,bytes calldata data,tuple(bytes32[] calldata path,bytes signature)[] calldata proofs, string note) external returns (bool success)",
  ])

  console.log(
    checkTitle,
    chainId,
    safe,
    nonce,
    to,
    value,
    data,
    proofs.map((proof) => ({ path: proof.data.path, signature: proof.signature.data.signature }))
  )

  const sortedProofs = proofs.sort((a, b) => {
    const addressA = BigNumber.from(a.signature.signer)
    const addressB = BigNumber.from(b.signature.signer)

    return addressA.gt(addressB) ? 1 : -1
  })

  const checkbookData = checkbookInterface.encodeFunctionData("execute", [
    safe,
    nonce,
    ZERO_ADDRESS,
    to,
    value,
    data,
    sortedProofs.map((proof) => ({
      path: proof.data.path,
      signature: proof.signature.data.signature,
    })),
    // TODO: we should notify users that the check title will be published on-chain if the checkbook is public
    // if the checkbook is private, we should pass in an empty string to not publicize on chain
    checkTitle,
  ])

  return {
    chainId,
    to: CHECKBOOK_MODULE_ADDRESS[chainId],
    value: 0,
    data: checkbookData,
  }
}
