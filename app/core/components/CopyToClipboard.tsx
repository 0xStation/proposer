import { useState } from "react"
import { ClipboardCheckIcon, ClipboardIcon } from "@heroicons/react/outline"

export const AddressLink = ({
  className = "",
  text,
  children,
}: {
  className?: string
  text: string
  children?: any
}) => {
  const [isClipboardAddressCopied, setIsClipboardAddressCopied] = useState<boolean>(false)

  return (
    <div>
      <button
        className={className}
        onClick={() => {
          navigator.clipboard.writeText(text).then(() => {
            setIsClipboardAddressCopied(true)
            setTimeout(() => setIsClipboardAddressCopied(false), 3000)
          })
        }}
      >
        {children}
        {isClipboardAddressCopied ? (
          <>
            <ClipboardCheckIcon className="h-4 w-4 cursor-pointer" />
          </>
        ) : (
          <ClipboardIcon className="h-4 w-4 hover:text-marble-white cursor-pointer" />
        )}
      </button>
    </div>
  )
}

export default AddressLink
