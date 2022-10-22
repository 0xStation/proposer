import Link from "next/link"
import { Routes } from "@blitzjs/next"
import { useEnsName } from "wagmi"
import truncateString from "app/core/utils/truncateString"
import Avatar from "app/core/components/sds/images/avatar"
import CopyToClipboard from "./CopyToClipboard"
import { Account } from "app/account/types"

const AccountMediaObject = ({
  account,
  className = "",
  showActionIcons = false,
}: {
  account: Account
  className?: string
  showActionIcons?: boolean
}) => {
  const { data: ensName } = useEnsName({
    address: account?.address as string,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
  })

  return (
    <Link href={Routes.WorkspaceHome({ accountAddress: account?.address as string })}>
      <div className={`flex flex-row rounded ${className} cursor-pointer`}>
        <div className="flex flex-col content-center align-middle mr-3">
          <Avatar address={account.address as string} pfpUrl={account?.data?.pfpUrl} />
        </div>
        <div className="flex flex-col content-center">
          <div className="flex flex-row items-center space-x-1">
            <p className="text-base text-marble-white font-bold">
              {account?.data?.name || ensName || truncateString(account?.address || "")}
            </p>
          </div>
          <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
            <p className="w-max truncate leading-4">
              @{ensName || truncateString(account?.address || "")}
            </p>
            {showActionIcons && <CopyToClipboard text={account?.address || ""} />}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default AccountMediaObject
