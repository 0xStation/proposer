import React from "react"

interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean
  /**
   * Button contents
   */
  label: string
  /**
   * Optional click handler
   */
  onClick?: () => void
}

/**
 * Primary UI component for user interaction.
 */
export const Button = ({ primary = false, label, ...props }: ButtonProps) => {
  return (
    <button
      type="button"
      className={`${primary ? "bg-electric-violet text-tunnel-black" : "text-electric-violet"}
        ${label.length <= 5 ? "w-[98px]" : "px-6"} border border-electric-violet rounded h-[35px]`}
      {...props}
    >
      {label}
    </button>
  )
}
