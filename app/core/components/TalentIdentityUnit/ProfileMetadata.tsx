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
}

export const ProfileMetadata = ({
  pfpURL,
  name,
  ens,
  address,
  pronouns,
  verified = false,
}: ProfileMetadataProps) => {
  const fallbackProfile = (
    <div className="h-[40px] w-[40px] place-self-center border border-marble-white rounded-full place-items-center"></div>
  )

  const profileImage = pfpURL ? (
    <div className="flex-2/5 m-auto">
      <img
        src={pfpURL}
        alt="PFP"
        className="h-[40px] w-[40px] border border-marble-white rounded-full"
      />
    </div>
  ) : (
    fallbackProfile
  )

  return (
    <div className="flex flex-row flex-auto content-center mx-3 my-3 space-x-1">
      <div className="flex-2/5 content-center align-middle mr-1">{profileImage}</div>
      <div className="flex flex-col flex-1 content-center">
        <div className="flex flex-row items-center flex-1 space-x-1">
          <div className="text-lg">{name}</div>
          {verified && (
            <div className="m-auto">
              <Image src={Verified} alt="Verified icon." width={10} height={10} />
            </div>
          )}
        </div>
        <div className="flex flex-row flex-1 text-sm text-concrete space-x-1 overflow-hidden">
          <div className="max-w-[150px] truncate">{truncateString(ens || address)}</div>
          {pronouns && <div className="">· {pronouns}</div>}
        </div>
      </div>
    </div>
  )
}

export default ProfileMetadata
