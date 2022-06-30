import { CheckApproval as PrismaCheckApproval } from "@prisma/client"

export type CheckApprovalMetadata = {
  signature: string
}

export type CheckApproval = PrismaCheckApproval & { data: CheckApprovalMetadata }
