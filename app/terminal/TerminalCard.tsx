import Tag from "app/core/components/Tag"
import { getNftImageUrl } from "app/utils/getNftImageUrl"
import { Link, Routes } from "blitz"

const TerminalCard = ({ ticket }) => {
  return (
    // <Link
    //   href={Routes.TerminalInitiativePage({
    //     terminalHandle: ticket?.terminal?.handle,
    //   })}
    // >
    <div className="border border-concrete min-w-[320px] cursor-pointer mr-4 mb-4 hover:border-marble-white">
      <div className="flex flex-row items-center p-2 border-b border-concrete">
        <img
          alt="The terminal's profile picture, or logo."
          src={ticket?.terminal?.data?.pfpURL}
          className="h-9 w-9 rounded-full border border-marble-white mr-2"
        />
        <div>
          <p className="text-marble-white">{ticket?.terminal?.data?.name}</p>
          <p className="text-xs text-concrete mt-[-2px]">@{ticket?.terminal?.handle}</p>
        </div>
      </div>
      <img
        alt="The terminal's ticket."
        src={getNftImageUrl(ticket?.terminal, ticket)}
        className="h-[300px] w-full"
      />
      <div className="flex flex-row items-center p-2 border-t border-concrete justify-between">
        <Tag type="role">
          {ticket?.terminal.roles.find((r) => r.localId === ticket?.roleLocalId).data.value}
        </Tag>
        <p className="text-concrete text-xs">
          SINCE{" "}
          {Object.prototype.toString.call(ticket?.joinedAt) === "[object Date]"
            ? ticket?.joinedAt?.toISOString().split("T")[0]
            : ""}
        </p>
      </div>
    </div>
    // </Link>
  )
}
export default TerminalCard
