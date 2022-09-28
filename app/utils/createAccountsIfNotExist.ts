import truncateString from "app/core/utils/truncateString"
import db, { AddressType } from "db"
import { getAddressType } from "./getAddressType"

// Utility function for server-side MUTATIONS to create accounts if needed for a list of addresses
// used initially to create accounts for proposal members, but a common enough pattern for us to re-use
// separating to separate function cleans up mutation at the minimum.
export async function createAccountsIfNotExist(addresses: string[]) {
  const uniqueRoleAddresses = addresses.filter((v, i, addresses) => addresses.indexOf(v) === i)
  const accounts = await db.account.findMany({
    where: {
      address: {
        in: uniqueRoleAddresses,
      },
    },
  })
  const addressesMissingAccounts = uniqueRoleAddresses.filter((address) =>
    accounts.some((account) => account.address !== address)
  )
  // with list of missing addresses, determine their AddressType
  const addressClassificationRequests = addressesMissingAccounts.map((address) =>
    getAddressType(address)
  )
  const addressClassificationResponses = await Promise.all(addressClassificationRequests)
  // create many Accounts with proper type
  await db.account.createMany({
    skipDuplicates: true, // do not create entries that already exist
    data: addressesMissingAccounts.map((address, i) => {
      const { addressType, chainId } = addressClassificationResponses[i]!
      return {
        address,
        addressType,
        data: {
          name: truncateString(address),
          ...(addressType !== AddressType.WALLET && { chainId }),
        },
      }
    }),
  })
}
