import { Comment as PrismaComment } from "@prisma/client"
import { Account } from "app/account/types"

export type Comment = PrismaComment & {
  author: Account
  data: CommentMetadata
}

// fill out when we get to v2
export type CommentMetadata = {
  body: string
}
