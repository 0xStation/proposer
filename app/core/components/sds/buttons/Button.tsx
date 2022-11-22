import React from "react"
import { Spinner } from "../../Spinner"

export enum ButtonType {
  Primary = "primary",
  Secondary = "secondary",
  Unemphasized = "unemphasized",
}

const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  type?: ButtonType
  /**
   * If the button is part of a form and should have submit type (vs button type)
   * There is also reset button type, but I don't think we ever use that.
   */
  isSubmitType?: boolean
  /**
   * If the button is disabled
   */
  isDisabled?: boolean
  /**
   * If the button is in a loading state
   */
  isLoading?: boolean
  /**
   * Override default 96px and dynamic width for buttons by providing an alternative className
   */
  overrideWidthClassName?: string
  /**
   * Override default 35px and dynamic height for buttons by providing an alternative className
   */
  overrideHeightClassName?: string
  /**
   * Any additional classNames
   */
  className?: string
  /**
   * Optional click handler
   */
  onClick?: (e: any) => void
  /**
   * Button contents
   */
  children: string
}

/**
 * Primary UI component for user interaction.
 */
const Button = ({
  type = ButtonType.Primary,
  isSubmitType = false,
  isDisabled = false,
  isLoading = false,
  overrideWidthClassName = undefined,
  overrideHeightClassName = undefined,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={isSubmitType ? "submit" : "button"}
      disabled={isDisabled}
      className={classNames(
        `border rounded font-bold cursor-pointer ${className}`,
        isDisabled && "opacity-70 cursor-not-allowed",
        type === ButtonType.Primary &&
          "bg-electric-violet border-electric-violet text-tunnel-black hover:bg-electric-violet/80 hover:border-transparent",
        type === ButtonType.Secondary &&
          "text-electric-violet border-electric-violet bg-transparent hover:opacity-70",
        type === ButtonType.Unemphasized &&
          "text-marble-white border-marble-white bg-tunnel-black hover:bg-wet-concrete",
        overrideHeightClassName ? overrideHeightClassName : "h-[35px]",
        overrideWidthClassName
          ? overrideWidthClassName
          : children.length <= 5 || isLoading
          ? "w-[98px]"
          : "px-6"
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Spinner
            fill={
              type === ButtonType.Primary
                ? "black"
                : type === ButtonType.Secondary
                ? "#AD72FF"
                : "white"
            }
          />
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
