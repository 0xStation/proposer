import Avatar from "app/core/components/sds/images/avatar"
import { truncateString } from "app/core/utils/truncateString"
import timeSince from "app/core/utils/timeSince"
import { useEnsName } from "wagmi"

const AccountMediaRow = ({ comment }) => {
  const { data: ensName } = useEnsName({
    address: comment.author.address || undefined,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
  })

  return (
    <div className="flex flex-row space-x-2 items-center">
      <Avatar address={comment.author.address as string} pfpUrl={comment.author.pfpUrl} />
      <span className="text-marble-white">{comment.author.data?.name}</span>
      <span className="text-concrete text-sm">
        {ensName || truncateString(comment.author.address)}
      </span>
      <span className="text-light-concrete text-sm">{timeSince(comment.createdAt)}</span>
    </div>
  )
}

export default AccountMediaRow
