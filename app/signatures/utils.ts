import { _TypedDataEncoder } from "@ethersproject/hash"

/**
 * Produce a bytes32 hash per the EIP712 spec of taking the domain, types, message schema
 * and iteratively keccak256 parts of it to result in one content-dependent hash.
 *
 * This hash is the EVM-native way of signing typed data and lets us have a consistently sized content-dependent identifier for versions
 * this is important to demonstrate that even if the content of a proposal changes at a given UUID, the signature still indicates what exact data it signed.
 *
 */
export function getHash(domain, types, message) {
  return _TypedDataEncoder.hash(domain, types, message)
}
