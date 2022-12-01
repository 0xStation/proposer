import { Routes } from "@blitzjs/next"
import Avatar from "app/core/components/sds/images/avatar"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import { Sizes } from "app/core/utils/constants"
import Link from "next/link"

export const AccountPill = ({ account }) => {
  const displayAddress = useDisplayAddress(account?.address)

  return (
    <Link href={Routes.WorkspaceHome({ accountAddress: account?.address as string })}>
      <div className="cursor-pointer flex flex-row space-x-2 items-start items-center bg-wet-concrete rounded-full p-2 w-fit">
        <Avatar
          size={Sizes.SM}
          address={account?.address as string}
          pfpUrl={account?.data?.pfpUrl}
        />
        <span className="text-marble-white text-md pr-2">
          {account?.data?.name || displayAddress?.text}
        </span>
      </div>
    </Link>
  )
}
