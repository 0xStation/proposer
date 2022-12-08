import { PencilIcon } from "@heroicons/react/solid"

export const EditIcon = ({ disabled = false, children }) => {
  const disabledStyling = disabled ? "text-concrete" : "text-marble-white"
  return (
    <div className="inline w-fit cursor-pointer align-middle">
      <PencilIcon className={`h-5 w-5 inline ${disabledStyling}`} />
      <p className={`inline ml-2 ${disabledStyling}`}>{children}</p>
    </div>
  )
}
