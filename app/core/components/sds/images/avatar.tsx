import React from "react"
import { Sizes } from "app/core/utils/constants"
import { gradientMap } from "app/core/utils/constants"
import { Image } from "blitz"

interface AvatarProps {
  /**
   * Optional pfp url
   */
  pfpURL?: string
  size?: string
  address?: string
}

/**
 * thumbnail representation of an account
 */
const Avatar = ({ pfpURL, size = Sizes.BASE, address, ...props }: AvatarProps) => {
  const gradient = address ? gradientMap[parseInt(address, 16) % 6].src : gradientMap[0].src
  return (
    <Image
      src={pfpURL || gradient}
      alt="Account profile picture. If no profile picture is set, there is a linear gradient."
      height={size === Sizes.SM ? 24 : size === Sizes.BASE ? 42 : 60}
      width={size === Sizes.SM ? 24 : size === Sizes.BASE ? 42 : 60}
      className="rounded-full"
    />
  )
}

export default Avatar
