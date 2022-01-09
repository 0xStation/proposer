export type AccountMetadata = {
  name: string
  handle: string
  wallet?: string
  pfpURL?: string
  webURL?: string
  githubURL?: string
  twitterURL?: string
  skills: string[]
  pronouns: string
  discord: string
  verified: boolean
  role?: string
}

export type Account = {
  id: number
  address: string
  data: AccountMetadata
}
