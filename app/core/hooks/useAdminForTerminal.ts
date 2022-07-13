import { useQuery, useSession } from "blitz"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"

const useAdminForTerminal = (terminal) => {
  const session = useSession({ suspense: false })

  const [hasTagAdminPermissions] = useQuery(
    hasAdminPermissionsBasedOnTags,
    { terminalId: terminal?.id as number, accountId: session.userId as number },
    {
      suspense: false,
    }
  )
  const isLoggedInAndIsAdmin =
    (session.siwe?.address && hasTagAdminPermissions) ||
    terminal?.data?.permissions?.accountWhitelist?.includes(session?.siwe?.address as string)

  return isLoggedInAndIsAdmin
}

export default useAdminForTerminal
