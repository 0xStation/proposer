import { useState } from "react"
import { BlitzPage, Link, Routes, useParam, useQuery } from "blitz"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import Navigation from "app/terminal/components/settings/navigation"
import getGroupedTagsByTerminalId from "app/tag/queries/getGroupedTagsByTerminalId"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"

const TokenSettingsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const [tokenTags, setTokenTags] = useState([])

  const [groupedTags] = useQuery(
    getGroupedTagsByTerminalId,
    { terminalId: terminal?.id as number },
    {
      suspense: false,
      onSuccess: (groupedTags) => {
        if (!groupedTags || !groupedTags["token"]) {
          return
        }
        setTokenTags(groupedTags["token"])
      },
    }
  )

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        {tokenTags.length === 0 && (
          <div className="w-full h-full flex items-center flex-col justify-center">
            <p className="text-marble-white text-2xl font-bold">Add Tokens</p>
            <p className="mt-2 text-marble-white text-base w-[400px] text-center">
              Add tokens that represent your community&apos;s membership and ownership.
            </p>
            <Link href={Routes.NewTokenSettingsPage({ terminalHandle })}>
              <button className="cursor-pointer mt-8 w-[200px] py-1 bg-magic-mint text-tunnel-black rounded text-base">
                Add
              </button>
            </Link>
          </div>
        )}
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

export default TokenSettingsPage
