import { Account } from "app/account/types"
import { DefaultCtx, SessionContext } from "blitz"
import { SiweMessage } from "siwe"
import * as z from "zod"

export interface AddressOrUserIdIsAuthorized {
  ({ ctx, args }: { ctx: any; args: [addresses: string[], ids: number[]] }): boolean
}

export type Role = "ADMIN" | "USER"
declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: AddressOrUserIdIsAuthorized
    PublicData: {
      userId?: number | null
      nonce?: string
      role?: Role
      siwe?: SiweMessage
      activeUser?: Account | null
    }
  }
}
