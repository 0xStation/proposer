export type CheckbookMetadata = {
  tokens: string[] // list of token addresses to check balance of
}

export type Checkbook = {
  address: string
  chainId: number
  name: string
  data: CheckbookMetadata
}
