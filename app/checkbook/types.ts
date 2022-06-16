export type CheckbookMetadata = {
  quorum: number // probably needs an automated updating process from live on-chain data
  signers: string[] // probably needs an automated updating process from live on-chain data
  tagId?: number // tagId associated with checkbook to represent signer-ship
}

export type Checkbook = {
  address: string
  chainId: number
  name: string
  data: CheckbookMetadata
}
