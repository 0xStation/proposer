export enum RepresentingSignatureType {
  SAFE = "SAFE",
}

export type ProposalMetadata = {
  signature: string
  representing?: {
    address: string
    chainId: number
    validationType: RepresentingSignatureType
  }
}

export type ProposalSignature = {
  address: string
  timestamp: Date
  data: ProposalMetadata
}
