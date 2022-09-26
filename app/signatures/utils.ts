import { _TypedDataEncoder } from "@ethersproject/hash"

export function getHash(domain, types, message) {
  return _TypedDataEncoder.hash(domain, types, message)
}
