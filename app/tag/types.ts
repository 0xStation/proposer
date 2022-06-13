export enum TagType {
  STATUS = "status",
  ROLE = "role",
  PROJECT = "project",
  GUILD = "guild",
}

export type Tag = {
  id: number
  terminalId: number
  value: string
  type: TagType
  active: boolean
  discordId?: string
}
