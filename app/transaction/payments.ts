import { ETH_METADATA } from "app/core/utils/constants"
import { Interface } from "@ethersproject/abi"
import { parseUnits } from "ethers/lib/utils"
import { Token } from "app/token/types"

export const preparePaymentTransaction = (
  recipientAddress: string,
  token: Token,
  amount: string
) => {
  let target
  let value
  let data

  if (token.address === ETH_METADATA.address) {
    // if transferring ETH, call recipient directly with value, no call data
    target = recipientAddress
    value = parseUnits(amount, ETH_METADATA.decimals)
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
      parseUnits(amount, token.decimals),
    ])
  }

  return {
    chainId: token.chainId,
    to: target,
    value,
    data,
  }
}