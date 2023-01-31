import { Interface } from "@ethersproject/abi"
import { hexDataLength } from "@ethersproject/bytes"
import { pack } from "@ethersproject/solidity"
import { PreparedTransaction } from "app/transaction/types"
import { checkbookTransaction } from "app/checkbook/transaction"
import { Check } from "app/check/types"

// tx -> prepare tx as checkbook execute tx -> pack as multisend

// docs
// https://github.com/gnosis/ethers-multisend/blob/main/src/encodeMulti.ts

export const MULTI_SEND_ABI = ["function multiSend(bytes memory transactions)"]
const GOERLI_MULTI_SEND_CONTRACT_ADDRESS = "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D" // call only contract
const MULTI_SEND_CONTRACT_ADDRESS = "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761"

/// Encodes the transaction as packed bytes of:
/// - `operation` as a `uint8` with `0` for a `call` or `1` for a `delegatecall` (=> 1 byte),
/// - `to` as an `address` (=> 20 bytes),
/// - `value` as a `uint256` (=> 32 bytes),
/// -  length of `data` as a `uint256` (=> 32 bytes),
/// - `data` as `bytes`.
const encodePacked = (tx: PreparedTransaction) => {
  return pack(
    ["uint8", "address", "uint256", "uint256", "bytes"],
    // not sure if we should use 0 or 1
    [0, tx.target, tx.value, hexDataLength(tx.data), tx.data]
  )
}

const wrapInExecute = (check: Check) => {
  const { to, value, data } = checkbookTransaction({
    checkTitle: check.data.title,
    chainId: check.chainId,
    safe: check.address,
    nonce: check.nonce,
    to: check.data.txn.to,
    value: check.data.txn.value,
    data: check.data.txn.data,
    operation: check.data.txn.operation,
    proofs: check?.proofs,
  })

  return {
    target: to,
    operation: 0,
    value: String(value),
    data,
  } as PreparedTransaction
}

const remove0x = (hexString: string) => hexString.substr(2)

// Encodes a batch of module transactions into a single multiSend module transaction.
export const prepareBatchTransaction = (chainId: number, transactions: readonly Check[]) => {
  const transactionsEncoded =
    "0x" + transactions.map(wrapInExecute).map(encodePacked).map(remove0x).join("")

  const multiSendContract = new Interface(MULTI_SEND_ABI)
  const data = multiSendContract.encodeFunctionData("multiSend", [transactionsEncoded])

  const multiSendContractAddress =
    chainId === 5 ? GOERLI_MULTI_SEND_CONTRACT_ADDRESS : MULTI_SEND_CONTRACT_ADDRESS

  return {
    operation: 1, // always delegateCall for multisend
    to: multiSendContractAddress,
    value: "0x00",
    data,
  }
}
