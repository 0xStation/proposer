import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"

export const getSafeContractVersion = async (chainId: number, address: string) => {
  const gnosisSafeDetails = await getGnosisSafeDetails(chainId, address)
  if (!gnosisSafeDetails?.version) {
    console.error("Could not retrieve Safe contract version for: " + address)
    throw Error("Could not retrieve Safe contract version for: " + address)
  }
  return gnosisSafeDetails.version
}
