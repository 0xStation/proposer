import { Interface } from "@ethersproject/abi"
import { Token } from "app/token/types"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"
import { getNetworkCoin } from "app/core/utils/networkInfo"
import { ZERO_ADDRESS } from "app/core/utils/constants"
import { BigNumber } from "ethers"

export const preparePaymentTransaction = (
  recipientAddress: string,
  token: Token,
  amount: number
) => {
  let target
  let value
  let data

  if (token.address === getNetworkCoin(token.chainId)?.address) {
    // if transferring ETH, call recipient directly with value, no call data
    target = recipientAddress
    value = decimalToBigNumber(amount, getNetworkCoin(token.chainId)?.decimals || 0)
    data = "0x"
  } else {
    // if transferring ERC20, call contract with no value, providing encoded data for `transfer` function
    target = token.address
    value = 0
    const erc20TransferInterface = new Interface([
      "function transfer(address to, uint256 amount) external returns (bool)",
    ])
    data = erc20TransferInterface.encodeFunctionData("transfer", [
      recipientAddress,
      decimalToBigNumber(amount, token.decimals || 0),
    ])
  }

  return {
    chainId: token.chainId,
    to: target,
    value,
    data,
  }
}

export const prepareSafeTransaction = ({ to, value, data }, confirmations) => {
  // turn confirmations array into one string of concatenated signatures
  // order of signatures needs to be in increasing address order, which already seems to be done by Safe API
  // we also sort by increasing address just in case.
  const signatures = confirmations
    .sort((a, b) => (BigNumber.from(a.owner).gt(BigNumber.from(b.owner)) ? 1 : -1)) // sort confirmations by increasing address order, needed for smart contract validation
    .reduce(
      (acc, confirmation) =>
        acc + confirmation.signature.substring(2, confirmation.signature.length),
      "0x"
    )

  const execTransactionInterface = new Interface([
    `function execTransaction(
      address to,
      uint256 value,
      bytes calldata data,
      uint8 operation,
      uint256 safeTxGas,
      uint256 baseGas,
      uint256 gasPrice,
      address gasToken,
      address payable refundReceiver,
      bytes memory signatures
  ) public payable returns (bool success)`,
  ])
  const txnData = execTransactionInterface.encodeFunctionData("execTransaction", [
    to,
    value,
    data,
    0, // operation
    0, // safeTxGas
    0, // baseGas
    0, // gasPrice
    ZERO_ADDRESS, // gasToken
    ZERO_ADDRESS, // refundReceiver
    signatures,
  ])

  return txnData
}
