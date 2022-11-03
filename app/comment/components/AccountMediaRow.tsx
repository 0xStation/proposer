import { useEnsName } from "wagmi"
import Avatar from "app/core/components/sds/images/avatar"
import { truncateString } from "app/core/utils/truncateString"
import timeSince from "app/core/utils/timeSince"
import { Sizes } from "app/core/utils/constants"

const AccountMediaRow = ({ comment }) => {
  const { data: ensName } = useEnsName({
    address: comment.author.address || undefined,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
  })

  return (
    <div className="flex flex-row space-x-2 items-center">
      <Avatar
        size={Sizes.SM}
        address={comment.author.address as string}
        pfpUrl={comment.author.pfpUrl}
      />
      {comment.author.data?.name && (
        <span className="text-marble-white text-base">{comment.author.data?.name}</span>
      )}
      <span className="text-concrete text-xs">
        {ensName || truncateString(comment.author.address)}
      </span>
      <span className="text-light-concrete text-sm">{timeSince(comment.createdAt)}</span>
    </div>
  )
}

export default AccountMediaRow
