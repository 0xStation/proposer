import { Loader } from "./Loader"

type ButtonProps = {
  onClick?: (e) => void
  secondary?: boolean
  className?: string
  children?: any
  loading?: boolean
  disabled?: boolean
  type?: "button" | "reset" | "submit"
}
export const Button = ({
  onClick,
  secondary = false,
  className,
  children,
  loading = false,
  disabled = false,
  type,
}: ButtonProps) => {
  const primaryStyling = "bg-magic-mint text-tunnel-black hover:opacity-50"
  const secondaryStyling = "border-solid border border-magic-mint text-magic-mint hover:bg-concrete"
  const buttonStyling = secondary ? secondaryStyling : primaryStyling

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${
        disabled ? "opacity-50" : ""
      } ${buttonStyling} rounded mx-auto block p-1 ${className}`}
    >
      {loading ? <Loader /> : children}
    </button>
  )
}

export default Button
