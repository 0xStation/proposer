import { useState } from "react"
import { LinkIcon } from "@heroicons/react/solid"

export const CopyBtn = ({
  textToWrite = "",
  className,
}: {
  textToWrite?: string
  className?: string
}) => {
  const [isTextCopied, setIsTextCopied] = useState<boolean>(false)
  return (
    // TODO: add icons to buttons for sds, currently can't use unemphasized button
    <div className={`${className} group inline`}>
      <button
        onClick={() => {
          navigator.clipboard.writeText(textToWrite)
          setIsTextCopied(true)
          setTimeout(() => setIsTextCopied(false), 1500)
        }}
        className={`${
          isTextCopied ? "ring-2 ring-concrete" : ""
        } group px-2 w-fit h-8 justify-center text-marble-white border rounded border-marble-white bg-tunnel-black hover:bg-wet-concrete`}
      >
        <LinkIcon className="h-5 w-5 inline" />
        Copy link
      </button>
    </div>
  )
}
