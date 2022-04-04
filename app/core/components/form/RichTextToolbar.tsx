import { Editor, Transforms, Element as SlateElement } from "slate"
import { useSlate } from "slate-react"

import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered"
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"
import FormatItalicIcon from "@mui/icons-material/FormatItalic"
import FormatBoldIcon from "@mui/icons-material/FormatBold"
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined"
import CodeIcon from "@mui/icons-material/Code"
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"

const LIST_TYPES = ["numbered-list", "bulleted-list"]

const RichTextToolbar = () => {
  return (
    <div
      className={`bg-wet-concrete border-concrete flex flex-col border-l border-r border-t mt-0.5 w-full overflow-scroll relative`}
    >
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
          <MarkButton format="code" icon={<CodeIcon />} />
        </li>
        <li>
          <BlockButton format="block-quote" icon={<FormatQuoteIcon />} />
        </li>
        <li>
          <BlockButton format="numbered-list" icon={<FormatListNumberedIcon />} />
        </li>
        <li>
          <BlockButton format="bulleted-list" icon={<FormatListBulletedIcon />} />
        </li>
      </ul>
    </div>
  )
}

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
    split: true,
  })
  let newProperties: Partial<SlateElement>

  newProperties = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  }

  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format,
    })
  )

  return !!match
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

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
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

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
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

export default RichTextToolbar
