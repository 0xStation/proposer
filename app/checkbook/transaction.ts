import { Interface } from "@ethersproject/abi"
import { CHECKBOOK_MODULE_ADDRESS, ZERO_ADDRESS } from "app/core/utils/constants"
import { BigNumber } from "@ethersproject/bignumber"

// function execute(
//     address safe,
//     uint256 nonce,
//     address executor,
//     address to,
//     uint256 value,
//     uint8 operation,
//     bytes calldata data,
//     bytes[] calldata signatures
// ) external returns (bool success)

export const checkbookTransaction = ({
  chainId,
  safe,
  nonce,
  to,
  value,
  operation,
  data,
  proofs,
}) => {
  const checkbookInterface = new Interface([
    "function execute(address safe,uint256 nonce,address executor,address to,uint256 value,uint8 operation,bytes calldata data,tuple(bytes32[] calldata path,bytes signature)[] calldata proofs) external returns (bool success)",
  ])

  console.log(
    chainId,
    safe,
    nonce,
    to,
    value,
    operation,
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
    operation,
    data,
    sortedProofs.map((proof) => ({
      path: proof.data.path,
      signature: proof.signature.data.signature,
    })),
  ])

  return {
    chainId,
    to: CHECKBOOK_MODULE_ADDRESS[chainId],
    value: 0,
    data: checkbookData,
  }
}
