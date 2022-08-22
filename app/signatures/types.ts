export type TypedDataSignatureDomain = {
  name: string
  version: string
  chainId?: number
  verifyingContract?: string
}

export type TypedDataField = {
  name: string
  type: string // solidity type e.g. "address", "uint256", etc.
}

export type TypedDataTypeDefinition = Record<string, TypedDataField[]>

export type SignatureMessage = {
  domain: TypedDataSignatureDomain
  types: TypedDataTypeDefinition
  values: any
}

export type Signature = {
  address: string
  message: any
  signature: string
  timestamp: Date
}

export type FundingSignature = Signature & {
  approved: boolean
  // might add the actual details too (recipient, token, amount),
  // but for now FundingSignatures are nested within objects that already store this data
}
