import { ClipboardCheckIcon, ClipboardIcon } from "@heroicons/react/solid"
import { useState } from "react"

export const TextClipboard = ({ className = "", text }) => {
  const [isTextCopied, setIsTextCopied] = useState<boolean>(false)

  return (
    <div className={className}>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text).then(() => {
            setIsTextCopied(true)
            setTimeout(() => setIsTextCopied(false), 3000)
          })
        }}
      >
        {isTextCopied ? (
          <>
            <ClipboardCheckIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
          </>
        ) : (
          <ClipboardIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
        )}
      </button>
    </div>
  )
}

export default TextClipboard
