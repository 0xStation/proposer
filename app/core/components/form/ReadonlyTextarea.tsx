import { useMemo, useCallback } from "react"
import { createEditor } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { CustomElement } from "app/initiative/types"

const ReadonlyTextarea = ({ value }: { value: CustomElement[] }) => {
  const editor = useMemo(() => withReact(createEditor()), [])

  const renderElement = useCallback((props) => <Element {...props} />, [])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])

  return (
    <Slate editor={editor} value={value} onChange={() => null}>
      <Editable
        readOnly
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        className="prose text-marble-white prose-headings:text-marble-white  prose-strong:text-marble-white prose-code:text-marble-white prose-blockquote:text-marble-white prose-headings:m-0 prose-p:m-0 prose-blockquote:m-0"
      />
    </Slate>
  )
}

const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align }
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      )
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      )
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      )
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      )
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      )
  }
}

const Leaf = ({ attributes, children, leaf }) => {
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

export default ReadonlyTextarea
