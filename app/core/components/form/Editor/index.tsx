import { useState } from "react"
import { createEditor, Descendant, BaseEditor } from "slate"
import { Slate, Editable, withReact, ReactEditor } from "slate-react"
import { CustomElement, CustomText } from "app/deprecated/v1/initiative/types"
import Toolbar from "./components/Toolbar"
import Paragraph from "./elements/Paragraph"
import Link from "./elements/Link"
import withLinks from "./plugins/withLinks"
import BulletedList from "./elements/BulletedList"
import ListItem from "./elements/ListItem"

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

const renderElement = (props) => {
  switch (props.element.type) {
    case "link":
      return <Link {...props} />

    case "bulleted-list":
      return <BulletedList {...props} />

    case "list-item":
      return <ListItem {...props} />

    default:
      return <Paragraph {...props} />
  }
}

const renderLeaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const Editor = ({ onChange, initialValue }) => {
  const iv: CustomElement[] = initialValue || [
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }],
    },
  ]
  const [editor] = useState(() => withLinks(withReact(createEditor())))
  const [value, setValue] = useState<Descendant[]>(iv)

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(v) => {
        setValue(v)
        onChange(v)
      }}
    >
      <Toolbar />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        className="bg-wet-concrete border-concrete border p-2 prose text-marble-white prose-headings:text-marble-white prose-strong:text-marble-white prose-code:text-marble-white prose-blockquote:text-marble-white prose-headings:m-0 prose-p:m-0 prose-blockquote:m-0 prose-a:text-magic-mint prose-a:text-underline"
        placeholder="Enter some rich text…"
      />
    </Slate>
  )
}

export default Editor
