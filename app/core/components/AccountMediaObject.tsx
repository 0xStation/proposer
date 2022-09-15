import { Routes, Link } from "blitz"
import { useEnsName } from "wagmi"
import truncateString from "app/core/utils/truncateString"
import { gradientMap } from "app/core/utils/constants"

const AccountMediaObject = ({ account, className = "" }) => {
  const { data: ensName } = useEnsName({
    address: account?.address,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
  })

  return (
    <Link href={Routes.WorkspaceHome({ accountAddress: account?.address })}>
      <div className={`flex flex-row rounded ${className} cursor-pointer`}>
        <div className="flex flex-col content-center align-middle mr-3">
          <img
            src={account?.data?.pfpURL || gradientMap[parseInt(account.address, 16) % 6].src}
            alt="PFP"
            className="min-w-[40px] max-w-[40px] h-[40px] rounded-full cursor-pointer border border-wet-concrete"
            onError={(e) => {
              e.currentTarget.src = gradientMap[parseInt(account.address, 16) % 6].src
            }}
          />
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
          </div>
        </div>
      </div>
    </Link>
  )
}

export default AccountMediaObject
