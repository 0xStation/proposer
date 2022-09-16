import { Routes } from "blitz"
import { LinkIcon } from "@heroicons/react/solid"
import { genPathFromUrlObject } from "app/utils"

export const CopyBtn = ({ textToWrite = "" }) => (
  // TODO: add icons to buttons for sds, currently can't use unemphasized button
  <button
    onClick={() => navigator.clipboard.writeText(textToWrite)}
    className="w-11 h-[35px] justify-center text-marble-white border rounded border-marble-white bg-tunnel-black hover:bg-wet-concrete"
  >
    <LinkIcon className="h-5 w-5 inline" />
  </button>
)
