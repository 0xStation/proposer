import { useMemo } from "react"
import { createEditor } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import withLinks from "./Editor/plugins/withLinks"
import { CustomElement } from "app/deprecated/v1/initiative/types"

import Paragraph from "./Editor/elements/Paragraph"
import Link from "./Editor/elements/Link"
import BulletedList from "./Editor/elements/BulletedList"
import ListItem from "./Editor/elements/ListItem"

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

const ReadonlyTextarea = ({ value }: { value: CustomElement[] }) => {
  const editor = useMemo(() => withLinks(withReact(createEditor())), [])

  return (
    <Slate editor={editor} value={value} onChange={() => null}>
      <Editable
        readOnly
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        className="prose text-marble-white prose-headings:text-marble-white  prose-strong:text-marble-white prose-code:text-marble-white prose-blockquote:text-marble-white prose-headings:m-0 prose-p:m-0 prose-blockquote:m-0 max-w-none prose-a:text-magic-mint prose-a:text-underline"
      />
    </Slate>
  )
}

export default ReadonlyTextarea
