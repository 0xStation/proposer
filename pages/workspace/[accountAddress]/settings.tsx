import { BlitzPage, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import WorkspaceSettingsOverviewForm from "app/account/components/WorkspaceSettingsOverviewForm"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { Account } from "app/account/types"
import WorkspaceSidebar from "app/core/components/WorkspaceSidebar"
import useUserHasPermissionOfAddress from "app/core/hooks/useUserHasPermissionOfAddress"
import Layout from "app/core/layouts/Layout"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

export const WorkspaceSettings: BlitzPage = () => {
  const accountAddress = useParam("accountAddress", "string") as string
  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    {
      enabled: !!accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )
  const { hasPermissionOfAddress: hasPrivateAccess } = useUserHasPermissionOfAddress(
    accountAddress,
    account?.addressType,
    account?.data?.chainId
  )

  return (
    <>
      {hasPrivateAccess ? (
        <>
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="mt-10">
            <WorkspaceSettingsOverviewForm account={account as Account} isEdit={true} />
          </div>
        </>
      ) : (
        <div> You do not have access to this page.</div>
      )}
    </>
  )
}

WorkspaceSettings.suppressFirstRenderFlicker = true
WorkspaceSettings.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="Workspace">
      <div className="flex flex-col md:flex-row h-full">
        <WorkspaceSidebar />
        <div className="p-10 w-full max-h-screen overflow-y-auto">{page}</div>
      </div>
    </Layout>
  )
}
export default WorkspaceSettings
