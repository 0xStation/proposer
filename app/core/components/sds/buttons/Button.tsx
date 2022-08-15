import React from "react"
import { Spinner } from "../../Spinner"

export enum ButtonType {
  Primary = "primary",
  Secondary = "secondary",
  Unemphesized = "unemphesized",
}

const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

interface ButtonProps {
  /**
   * Button contents
   */
  label: string
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
   * Optional click handler
   */
  onClick?: () => void
}

/**
 * Primary UI component for user interaction.
 */
const Button = ({
  type = ButtonType.Primary,
  label,
  isSubmitType = false,
  isDisabled = false,
  isLoading = false,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={isSubmitType ? "submit" : "button"}
      disabled={isDisabled}
      className={classNames(
        "border rounded h-[35px] font-bold cursor-pointer",
        isDisabled && "opacity-50 cursor-default",
        type === ButtonType.Primary &&
          "bg-electric-violet border-electric-violet text-tunnel-black hover:bg-electric-violet/80 hover:border-transparent",
        type === ButtonType.Secondary &&
          "text-electric-violet border-electric-violet bg-tunnel-black hover:bg-wet-concrete",
        type === ButtonType.Unemphesized &&
          "text-marble-white border-marble-white bg-tunnel-black hover:bg-wet-concrete",
        label.length <= 5 || isLoading ? "w-[98px]" : "px-6"
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Spinner fill="black" />
        </div>
      ) : (
        label
      )}
    </button>
  )
}

export default Button
