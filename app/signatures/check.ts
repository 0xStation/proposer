import { ZERO_ADDRESS } from "app/core/utils/constants"
import { Interface } from "@ethersproject/abi"

export const genCheckSignatureMessage = (
  chainId,
  checkbookAddress,
  nonce,
  deadline: Date,
  recipient: string,
  token: string,
  amount
) => {
  let target
  let value
  let data

  if (token === ZERO_ADDRESS) {
    // if transferring ETH, call recipient directly with value, no call data
    target = recipient
    value = amount
    data = "0x"
  } else {
    // if transferring ERC20, call contract with no value, providing encoded data for `transfer` function
    target = token
    value = 0
    const erc20TransferInterface = new Interface([
      "function transfer(address to, uint256 amount) external returns (bool)",
    ])
    data = erc20TransferInterface.encodeFunctionData("transfer", [recipient, amount])
  }

  return {
    domain: {
      name: "Checkbook", // keep hardcoded
      version: "1", // keep hardcoded
      chainId,
      verifyingContract: checkbookAddress,
    },
    types: {
      BatchTxn: [{ name: "txns", type: "Txn[]" }],
      Txn: [
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "executor", type: "address" },
        { name: "target", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
      ],
    },
    value: {
      txns: [
        {
          nonce,
          deadline: deadline.valueOf(),
          executor: ZERO_ADDRESS,
          target,
          value,
          data,
        },
      ],
    },
  }
}
