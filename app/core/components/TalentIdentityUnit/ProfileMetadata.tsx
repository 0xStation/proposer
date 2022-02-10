import { Image } from "blitz"
import Verified from "/public/check-mark.svg"
import { truncateString } from "app/core/utils/truncateString"

type ProfileMetadataProps = {
  address: string
  pfpURL?: string
  name?: string
  handle?: string
  ens?: string
  pronouns?: string
  verified?: boolean
  className?: string
  large?: boolean
}

export const ProfileMetadata = ({
  pfpURL,
  name,
  ens,
  address,
  pronouns,
  verified = false,
  className,
  large = false,
}: ProfileMetadataProps) => {
  const pfpSize = large ? "h-[52px] w-[52px]" : "h-[40px] w-[40px]"
  const fallbackProfile = (
    <div
      className={`${pfpSize} place-self-center border border-marble-white bg-concrete rounded-full place-items-center`}
    ></div>
  )

  const profileImage = pfpURL ? (
    <div className="flex-2/5 m-auto">
      <img
        src={pfpURL}
        alt="PFP"
        className={`${pfpSize} border border-marble-white rounded-full`}
      />
    </div>
  ) : (
    fallbackProfile
  )

  return (
    <div className={`flex flex-row flex-auto content-center space-x-1 ${className}`}>
      <div className="flex-2/5 content-center align-middle mr-1">{profileImage}</div>
      <div className="flex flex-col flex-1 content-center">
        <div className="flex flex-row items-center flex-1 space-x-1">
          <div className={`${large && "font-bold"} text-lg text-marble-white`}>@{name}</div>
          {verified && (
            <div className="m-auto">
              <Image src={Verified} alt="Verified icon." width={10} height={10} />
            </div>
          )}
        </div>
        <div className="flex flex-row flex-1 text-sm text-concrete space-x-1 overflow-hidden">
          <div className="w-max truncate">{truncateString(ens || address)}</div>
        </div>
      </div>
    </div>
  )
}

export default ProfileMetadata
