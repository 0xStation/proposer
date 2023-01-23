import { useQuery } from "@blitzjs/rpc"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import getSafeMetadata from "app/account/queries/getSafeMetadata"

export const useSafeMetadata = ({ chainId, address }) => {
  const [safe] = useQuery(
    getSafeMetadata,
    { chainId: chainId, address: toChecksumAddress(address) },
    {
      enabled: !!chainId && !!address,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 30_1000,
    }
  )

  if (!safe && address === "0xb05C920cA0541620fcC6d2809f5776A9a3aA925c") {
    return {
      safe: {
        chainId: 5,
        address: "0xb05C920cA0541620fcC6d2809f5776A9a3aA925c",
        quorum: 1,
        signers: ["0x016562aA41A8697720ce0943F003141f5dEAe006"],
        nonce: 1,
      },
    }
  }

  return { safe }
}
