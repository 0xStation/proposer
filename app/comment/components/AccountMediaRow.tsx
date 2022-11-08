import Avatar from "app/core/components/sds/images/avatar"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import { Sizes } from "app/core/utils/constants"

const AccountMediaRow = ({ account }) => {
  const displayAddress = useDisplayAddress(account.address)

  return (
    <div className="flex flex-row space-x-2 items-start">
      <Avatar size={Sizes.SM} address={account.address as string} pfpUrl={account?.data?.pfpUrl} />
      {account.data?.name && (
        <span className="text-marble-white text-base">{account.data?.name}</span>
      )}
      <span className="text-concrete text-sm">{displayAddress.text}</span>
    </div>
  )
}

export default AccountMediaRow
