import truncateString from "app/core/utils/truncateString"
import db, { AddressType } from "db"
import { getAddressType } from "./getAddressType"

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
