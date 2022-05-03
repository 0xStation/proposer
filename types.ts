import { Account } from "app/account/types"
import { DefaultCtx, SessionContext, SimpleRolesIsAuthorized } from "blitz"
import { SiweMessage } from "siwe"

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
