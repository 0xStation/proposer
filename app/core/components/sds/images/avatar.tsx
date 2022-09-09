import React from "react"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"

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
const Avatar = ({ pfpURL, size = "base", ...props }: AvatarProps) => {
  return (
    <img
      src={pfpURL || DEFAULT_PFP_URLS.USER}
      className={classNames(
        `rounded-full`,
        size === "sm" && "min-w-[24px] max-w-[24px] h-[24px]",
        size === "base" && "min-w-[42px] max-w-[42px] h-[42px]",
        size === "lg" && "min-w-[60px] max-w-[60px] h-[60px]"
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
