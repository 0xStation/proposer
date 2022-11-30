import { Routes } from "@blitzjs/next"
import { Account } from "app/account/types"
import Avatar from "app/core/components/sds/images/avatar"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import { Sizes } from "app/core/utils/constants"
import Link from "next/link"

const AccountMediaRow = ({
  account,
  hideName = false,
}: {
  account?: Account | null
  hideName?: boolean
}) => {
  const displayAddress = useDisplayAddress(account?.address)

  return (
    <Link href={Routes.WorkspaceHome({ accountAddress: account?.address as string })}>
      <div className="cursor-pointer flex flex-row space-x-2 items-start items-center">
        <Avatar
          size={Sizes.SM}
          address={account?.address as string}
          pfpUrl={account?.data?.pfpUrl}
        />
        {!hideName && (
          <span className="text-marble-white text-sm">
            {account?.data?.name || displayAddress?.text}
          </span>
        )}
        <span className="text-concrete text-sm">{"@" + displayAddress?.text}</span>
      </div>
    </Link>
  )
}

export default AccountMediaRow
