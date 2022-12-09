import { PencilIcon } from "@heroicons/react/solid"

export const EditIcon = ({
  disabled = false,
  onClick,
  children,
}: {
  disabled?: boolean
  onClick?: () => void
  children?: any
}) => {
  const disabledStyling = disabled ? "text-concrete" : "text-marble-white"
  return (
    <button disabled={disabled} onClick={onClick}>
      <div className="inline mt-5 w-full cursor-pointer align-middle">
        <PencilIcon className={`h-5 w-5 inline ${disabledStyling}`} />
        <p className={`inline ml-2 ${disabledStyling}`}>{children}</p>
      </div>
    </button>
  )
}
