export enum StationPlatformTagValues {
  STATION_ADMIN = "station admin",
}

export enum TagType {
  STATUS = "status",
  ROLE = "role",
  PROJECT = "project",
  GUILD = "guild",
  SEASON = "season",
  TOKEN = "token",
  CHECKBOOK_SIGNER = "checkbook signer",
  INACTIVE = "inactive",
}

export type Tag = {
  id: number
  terminalId: number
  // usually label of tag
  value: string
  type: TagType
  active: boolean
  discordId?: string
  data?: any
}
