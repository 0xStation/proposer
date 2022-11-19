import Link from "next/link"
import { Routes } from "@blitzjs/next"
import { useState } from "react"
import { useEnsName } from "wagmi"
import truncateString from "app/core/utils/truncateString"
import Avatar from "app/core/components/sds/images/avatar"
import CopyToClipboard from "./CopyToClipboard"
import { Account } from "app/account/types"
import DiscordIcon from "../icons/DiscordIcon"

const AccountMediaObject = ({
  account,
  className = "",
  showActionIcons = false,
  shouldLinkToProposalPage = false,
}: {
  account: Account
  className?: string
  showActionIcons?: boolean
  shouldLinkToProposalPage?: boolean
}) => {
  const { data: ensName } = useEnsName({
    address: account?.address as `0x${string}`,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
  })
  const [isDiscordHandleCopied, setIsDiscordHandleCopied] = useState<boolean>(false)

  return (
    <Link
      href={
        shouldLinkToProposalPage
          ? Routes.ProposalNewFunding({
              clients: ensName || account?.address,
              contributors: ensName || account?.address,
            })
          : Routes.WorkspaceHome({ accountAddress: account?.address as string })
      }
    >
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
            {showActionIcons && (
              <>
                <CopyToClipboard text={account?.address || ""} />
                {account?.data?.discordHandle && (
                  <div className="group inline">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(account?.data?.discordHandle)
                        setIsDiscordHandleCopied(true)
                        setTimeout(() => setIsDiscordHandleCopied(false), 1500)
                      }}
                    >
                      <DiscordIcon fill="#646464" height={10} />
                    </button>
                    <span className="hidden group-hover:inline ml-1 text-[.6rem] uppercase font-bold tracking-wider rounded px-2 py-1 absolute text-marble-white bg-wet-concrete">
                      {isDiscordHandleCopied ? "copied!" : "copy to clipboard"}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default AccountMediaObject
