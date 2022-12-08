import { useEffect, useState } from "react"
import { invoke } from "@blitzjs/rpc"
import { Account } from "app/account/types"
import Avatar from "app/core/components/sds/images/avatar"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import { Sizes } from "app/core/utils/constants"
import getAccountByAddress from "app/account/queries/getAccountByAddress"

const AccountMediaRow = ({
  account,
  address,
  hideName = false,
}: {
  account?: Account | null
  address?: string
  hideName?: boolean
}) => {
  const [loadedAccount, setLoadedAccount] = useState<Account>()
  useEffect(() => {
    const loadAccount = async () => {
      const _loadedAccount = await invoke(getAccountByAddress, { address: address })
      if (_loadedAccount) {
        setLoadedAccount(_loadedAccount)
      }
    }
    loadAccount()
  }, [address])

  const displayAddress = useDisplayAddress(account?.address || address)

  return (
    <div className="flex flex-row space-x-2 items-start items-center">
      <Avatar
        size={Sizes.SM}
        address={account?.address || address}
        pfpUrl={account?.data?.pfpUrl || loadedAccount?.data.pfpUrl}
      />
      {!hideName && (
        <span className="text-marble-white text-sm">
          {account?.data?.name || displayAddress?.text || loadedAccount?.data.name}
        </span>
      )}
      <span className="text-concrete text-sm">{"@" + displayAddress?.text}</span>
    </div>
  )
}

export default AccountMediaRow
