import { useQuery } from "@blitzjs/rpc"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { AddressType } from "@prisma/client"
import getSafeMetadata from "app/account/queries/getSafeMetadata"
import { useSession } from "@blitzjs/auth"
import { useEffect, useState } from "react"

// checks if session address is an address or is a signer of the Safe located at address & chainId
export const useUserHasAuthority = (
  address: string,
  addressType?: AddressType,
  chainId?: number
): { hasAuthority: boolean } => {
  const session = useSession({ suspense: false })
  const [hasAuthority, setHasAuthority] = useState<boolean>(false)
  const safeQueryEnabled = !!address && addressType === AddressType.SAFE && !!chainId
  const [safeMetadata] = useQuery(
    getSafeMetadata,
    { chainId: chainId as number, address },
    {
      enabled: safeQueryEnabled,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  useEffect(() => {
    const userIsWorkspace = addressesAreEqual(session?.siwe?.address, address)
    const userIsWorkspaceSigner = safeMetadata?.signers.some((signer) =>
      addressesAreEqual(session?.siwe?.address, signer)
    )

    if (userIsWorkspace || userIsWorkspaceSigner) {
      setHasAuthority(true)
    } else {
      setHasAuthority(false)
    }
  }, [session?.siwe?.address, address, safeMetadata])

  return { hasAuthority }
}

export default useUserHasAuthority
