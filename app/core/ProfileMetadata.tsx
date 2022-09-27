import { Image } from "blitz"
import Verified from "/public/check-mark.svg"
import { truncateString } from "app/core/utils/truncateString"

type ProfileMetadataProps = {
  address: string
  pfpUrl?: string
  name?: string
  handle?: string
  ens?: string
  pronouns?: string
  verified?: boolean
  className?: string
  large?: boolean
}

export const ProfileMetadata = ({
  pfpUrl,
  name,
  ens,
  address,
  pronouns,
  verified = false,
  className = "",
  large = false,
}: ProfileMetadataProps) => {
  const pfpSize = large ? "h-[52px] w-[52px]" : "h-[40px] w-[40px]"

  const profileImage = pfpUrl ? (
    <div className="flex-2/5 m-auto">
      <img
        src={pfpUrl}
        alt="PFP"
        className={`${pfpSize} border border-marble-white rounded-full`}
      />
    </div>
  ) : (
    <div
      className={`${pfpSize} place-self-center border border-marble-white bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center`}
    ></div>
  )

  return (
    <div className={`flex content-center space-x-1 ${className}`}>
      <div className="flex-2/5 content-center align-middle mr-1">{profileImage}</div>
      <div className="flex flex-col content-center">
        <div className="flex flex-row items-center space-x-1">
          <div className={`${large && "font-bold"} text-lg text-marble-white`}>{name}</div>
          {verified && (
            <div className="m-auto">
              <Image src={Verified} alt="Verified icon." width={10} height={10} />
            </div>
          )}
        </div>
        <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
          <div className="w-max truncate">@{truncateString(ens || address)}</div>
        </div>
      </div>
    </div>
  )
}

export default ProfileMetadata
