import { Routes, Link } from "blitz"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import truncateString from "app/core/utils/truncateString"

const AccountMediaObject = ({ account, className = "" }) => {
  return (
    <Link href={Routes.WorkspaceHome({ accountAddress: account?.address })}>
      <div className={`flex flex-row rounded ${className}`}>
        <div className="flex flex-col content-center align-middle mr-3">
          {account?.data?.pfpURL ? (
            <img
              src={account?.data?.pfpURL}
              alt="PFP"
              className="min-w-[40px] max-w-[40px] h-[40px] rounded-full cursor-pointer border border-wet-concrete"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.USER
              }}
            />
          ) : (
            <div className="h-[40px] min-w-[40px] place-self-center border border-wet-concrete bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
          )}
        </div>
        <div className="flex flex-col content-center">
          <div className="flex flex-row items-center space-x-1">
            <p className="text-base text-marble-white font-bold">{account?.data?.name}</p>
          </div>
          <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
            <p className="w-max truncate leading-4">@{truncateString(account?.address)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default AccountMediaObject
