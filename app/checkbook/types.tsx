import { Checkbook as PrismaCheckbook } from "@prisma/client"

export type Checkbook = PrismaCheckbook & {
  data: CheckbookMetadata
}

export type CheckbookMetadata = {
  name: string
}
