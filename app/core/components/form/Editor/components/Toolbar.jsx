import { useSlateStatic } from "slate-react"
import FormatItalicIcon from "@mui/icons-material/FormatItalic"
import FormatBoldIcon from "@mui/icons-material/FormatBold"
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined"
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"
import InsertLinkIcon from "@mui/icons-material/InsertLink"

import { toggleBlock, isBlockActive } from "../utils/block"
import { toggleMark, isMarkActive } from "../utils/mark"
import { insertLink } from "../utils/link"

const Toolbar = () => {
  return (
    <div className="bg-wet-concrete border-concrete flex flex-col border-l border-r border-t mt-0.5 w-full overflow-scroll relative">
      <ul className="px-1 flex items-center sticky top-0 bg-white z-1 h-[33px]">
        <li>
          <MarkButton format="bold" icon={<FormatBoldIcon />} />
        </li>
        <li>
          <MarkButton format="italic" icon={<FormatItalicIcon />} />
        </li>
        <li>
          <MarkButton format="underline" icon={<FormatUnderlinedIcon />} />
        </li>
        <li>
          <LinkButton icon={<InsertLinkIcon />} />
        </li>
        <li>
          <BlockButton format="bulleted-list" icon={<FormatListBulletedIcon />} />
        </li>
      </ul>
    </div>
  )
}

const Button = ({ isActive, className = "", children, ...props }) => {
  return (
    <button
      type="button"
      className={`w-8 h-8 ${
        isActive ? "bg-navy-600 text-white opacity-100" : "opacity-50"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlateStatic()
  return (
    <Button
      isActive={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      {icon}
    </Button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlateStatic()
  return (
    <Button
      isActive={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      {icon}
    </Button>
  )
}

const LinkButton = ({ icon }) => {
  const editor = useSlateStatic()
  return (
    <Button
      isActive={false}
      onMouseDown={(event) => {
        event.preventDefault()
        const url = window.prompt("Enter the URL of the link:")
        if (!url) return
        insertLink(editor, url)
      }}
    >
      {icon}
    </Button>
  )
}

export default Toolbar
