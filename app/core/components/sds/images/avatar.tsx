import React from "react"
import { DEFAULT_PFP_URLS, Sizes } from "app/core/utils/constants"

interface AvatarProps {
  /**
   * Optional pfp url
   */
  pfpURL?: string
  size?: string
}

const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

/**
 * thumbnail representation of an account
 */
const Avatar = ({ pfpURL, size = Sizes.BASE, ...props }: AvatarProps) => {
  return (
    <img
      src={pfpURL || DEFAULT_PFP_URLS.USER}
      className={classNames(
        `rounded-full`,
        size === Sizes.SM && "min-w-[24px] max-w-[24px] h-[24px]",
        size === Sizes.BASE && "min-w-[42px] max-w-[42px] h-[42px]",
        size === Sizes.LG && "min-w-[60px] max-w-[60px] h-[60px]"
      )}
      alt="pfp"
      // if the pfpURL does not load properly, fall back to the default url.
      onError={(e) => {
        e.currentTarget.src = DEFAULT_PFP_URLS.USER
      }}
    />
  )
}

export default Avatar
