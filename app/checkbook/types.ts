export type CheckbookMetadata = {
  chainId: number
  name: string
  tokens: string[] // list of token addresses to check balance of
}

export type Checkbook = {
  address: string
  data: CheckbookMetadata
}
