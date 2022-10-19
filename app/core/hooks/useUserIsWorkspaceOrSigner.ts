import { AddressType } from "@prisma/client"
import { useQuery } from "blitz"
import useStore from "./useStore"
import getSafeMetadata from "app/account/queries/getSafeMetadata"

export const useUserIsWorkspaceOrSigner = ({ account }) => {
  const activeUser = useStore((state) => state.activeUser)
  const [safeMetadata] = useQuery(
    getSafeMetadata,
    { chainId: account?.data?.chainId!, address: account?.address! },
    {
      enabled: Boolean(account && account?.addressType === AddressType.SAFE),
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 5, // 5 minutes
    }
  )

  const userIsWorkspace = account?.address === activeUser?.address
  const userIsWorkspaceSigner = safeMetadata?.signers.includes(activeUser?.address as string)
  return { userIsWorkspace, userIsWorkspaceSigner }
}
