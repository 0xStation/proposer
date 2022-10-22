import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Routes, useParam } from "@blitzjs/next"
import React from "react"
import getRfpById from "../queries/getRfpById"
import { useUserIsWorkspaceOrSigner } from "app/core/hooks/useUserIsWorkspaceOrSigner"

export const RfpNavigator = () => {
  const router = useRouter()
  const rfpId = useParam("rfpId") as string
  const [rfp] = useQuery(
    getRfpById,
    { id: rfpId },
    {
      suspense: false,
      enabled: Boolean(rfpId),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )
  const { userIsWorkspace, userIsWorkspaceSigner } = useUserIsWorkspaceOrSigner({
    account: rfp?.account,
  })

  return (
    <div className="my-9 self-end flex flex-row space-x-4 border-b border-wet-concrete">
      <span
        className={`${
          router.pathname === Routes.RfpDetail({ rfpId }).pathname && "border-b mb-[-1px] font-bold"
        } cursor-pointer`}
        onClick={() => router.push(Routes.RfpDetail({ rfpId }))}
      >
        Submissions
      </span>
      {(userIsWorkspace || userIsWorkspaceSigner) && (
        <span
          className={`${
            router.pathname === Routes.RfpSettings({ rfpId }).pathname &&
            "border-b mb-[-1px] font-bold"
          } cursor-pointer`}
          onClick={() => router.push(Routes.RfpSettings({ rfpId }))}
        >
          Settings
        </span>
      )}
    </div>
  )
}
