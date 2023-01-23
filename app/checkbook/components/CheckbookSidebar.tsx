import React, { useState } from "react"
import { InboxIcon, LightBulbIcon } from "@heroicons/react/outline"
import { Routes, useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import truncateString from "app/core/utils/truncateString"
import { useCheckbook } from "../hooks/useCheckbook"
import SelectCheckbook from "./SelectCheckbook"
import useStore from "app/core/hooks/useStore"
import { useCheckbooks } from "../hooks/useCheckbooks"
import MetadataItem from "app/core/components/MetadataItem"
import { useSafeMetadata } from "app/safe/hooks/useSafeMetadata"
import CopyToClipboard from "app/core/components/CopyToClipboard"
import { getNetworkSymbol } from "app/core/utils/networkInfo"

export const CheckbookSidebar = () => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)

  const { checkbook } = useCheckbook(checkbookChainId, checkbookAddress)

  const { checkbooks } = useCheckbooks([])
  const { safe } = useSafeMetadata({ chainId: checkbookChainId, address: checkbookAddress })

  return (
    <>
      {/* LEFT SIDEBAR */}
      <div className="hidden md:block h-full min-w-[288px] max-w-[288px] border-r border-concrete p-6">
        <div className="pb-6 border-b border-wet-concrete">
          {/* PROFILE */}
          <SelectCheckbook current={checkbook} checkbooks={checkbooks || []} />
        </div>
        <div className="mt-6 pb-6 border-b border-wet-concrete space-y-6">
          {/* METADATA */}
          <MetadataItem label="location">
            <div className="flex flex-row space-x-4 items-center">
              <span className="text-sm py-0.5 px-2 rounded-full bg-wet-concrete">
                {getNetworkSymbol(checkbookChainId)}
              </span>
              <p>{truncateString(safe?.address)}</p>
              <CopyToClipboard text={safe?.address || ""} />
            </div>
          </MetadataItem>
          <MetadataItem label="quorum">{safe?.quorum}</MetadataItem>
          <MetadataItem label="signers">
            {safe?.signers?.map((address, idx) => (
              <p key={idx}>{truncateString(address)}</p>
            ))}
          </MetadataItem>
        </div>
        {/* TABS */}
        <ul className="mt-6 mb-12 space-y-2">
          {/* REQUESTS */}
          <li
            className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer hover:bg-charcoal ${
              router.pathname ===
                Routes.CheckbookHome({ chainId: checkbookChainId, address: checkbookAddress })
                  .pathname && "bg-wet-concrete"
            }`}
            onClick={() =>
              router.push(
                Routes.CheckbookHome({ chainId: checkbookChainId, address: checkbookAddress })
              )
            }
          >
            <LightBulbIcon className="h-5 w-5 text-white cursor-pointer" />
            <span>All Requests</span>
          </li>
          {/* INBOXES */}
          <li
            className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer hover:bg-charcoal ${
              router.pathname ===
                Routes.InboxesHome({ chainId: checkbookChainId, address: checkbookAddress })
                  .pathname && "bg-wet-concrete"
            }`}
            onClick={() =>
              router.push(
                Routes.InboxesHome({ chainId: checkbookChainId, address: checkbookAddress })
              )
            }
          >
            <InboxIcon className="h-5 w-5 text-white cursor-pointer" />
            <span>Inboxes</span>
          </li>
        </ul>
      </div>
    </>
  )
}

export default CheckbookSidebar
