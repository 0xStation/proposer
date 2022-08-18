import { Account } from "app/account/types"
import { DefaultCtx, SessionContext, SimpleRolesIsAuthorized } from "blitz"
import { SiweMessage } from "siwe"
import * as z from "zod"

export type Role = "ADMIN" | "USER"
declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<Role>
    PublicData: {
      userId?: number | null
      nonce?: string
      role?: Role
      siwe?: SiweMessage
      activeUser?: Account | null
    }
  }
}

export const Token = z.object({
  chainId: z.number(),
  address: z.string(),
  symbol: z.string(),
  decimals: z.number(),
})

export const TokenTag = z.object({
  chainId: z.number(),
  address: z.string(),
  type: z.string(),
  name: z.string(),
  symbol: z.string(),
})
