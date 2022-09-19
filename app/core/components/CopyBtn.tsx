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
          // @ts-ignore
          merlin.send({
            event_name: "test",
            event_type: "click",
          })
          navigator.clipboard.writeText(textToWrite)
          setIsTextCopied(true)
          setTimeout(() => setIsTextCopied(false), 1500)
        }}
        className={`${
          isTextCopied ? "ring-2 ring-concrete" : ""
        } group w-10 h-[35px] justify-center text-marble-white border rounded border-marble-white bg-tunnel-black hover:bg-wet-concrete`}
      >
        <LinkIcon className="h-5 w-5 inline" />
      </button>
      <span className="hidden group-hover:inline mt-1 ml-1 text-[.6rem] uppercase font-bold tracking-wider rounded px-2 py-1 absolute text-marble-white bg-wet-concrete">
        {isTextCopied ? "copied!" : "copy to clipboard"}
      </span>
    </div>
  )
}
