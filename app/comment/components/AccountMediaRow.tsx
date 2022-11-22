import { Account } from "app/account/types"
import Avatar from "app/core/components/sds/images/avatar"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import { Sizes } from "app/core/utils/constants"

const AccountMediaRow = ({
  account,
  hideName = false,
}: {
  account?: Account | null
  hideName?: boolean
}) => {
  const displayAddress = useDisplayAddress(account?.address)

  return (
    <div className="flex flex-row space-x-2 items-start items-center">
      <Avatar size={Sizes.SM} address={account?.address as string} pfpUrl={account?.data?.pfpUrl} />
      {!hideName && (
        <span className="text-marble-white text-sm">
          {account?.data?.name || displayAddress?.text}
        </span>
      )}
      <span className="text-concrete text-sm">{"@" + displayAddress?.text}</span>
    </div>
  )
}

export default AccountMediaRow
