import { useQuery } from "@blitzjs/rpc"
import { AddressType } from "@prisma/client"
import getSafeMetadata from "app/account/queries/getSafeMetadata"

export const useSafeMetadata = (address, addressType, chainId) => {
  console.log(address, addressType, chainId)
  const safeQueryEnabled = !!address && addressType === AddressType.SAFE && !!chainId
  const [safeMetadata] = useQuery(
    getSafeMetadata,
    { chainId: chainId as number, address },
    {
      enabled: safeQueryEnabled,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return safeMetadata
}
