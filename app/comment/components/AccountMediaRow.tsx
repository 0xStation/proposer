import Avatar from "app/core/components/sds/images/avatar"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import { Sizes } from "app/core/utils/constants"

const AccountMediaRow = ({ account }) => {
  const displayName = useDisplayAddress(account.address)

  return (
    <div className="flex flex-row space-x-2 items-center">
      <Avatar size={Sizes.SM} address={account.address as string} pfpUrl={account.pfpUrl} />
      {account.data?.name && (
        <span className="text-marble-white text-base">{account.data?.name}</span>
      )}
      <span className="text-concrete text-sm">{displayName.text}</span>
    </div>
  )
}

export default AccountMediaRow
