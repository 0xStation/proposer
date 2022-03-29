import { useMemo, useCallback } from "react"
import { createEditor } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { CustomElement } from "app/initiative/types"
import { Element, Leaf } from "./RichTextUtils"

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

export default ReadonlyTextarea
