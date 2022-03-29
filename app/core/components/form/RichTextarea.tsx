import React, { useState, useCallback } from "react"
import { createEditor, BaseEditor, Descendant } from "slate"
import { Slate, Editable, withReact, ReactEditor } from "slate-react"
import { CustomElement, CustomText } from "app/initiative/types"
import { Element, Leaf } from "./RichTextUtils"
import RichTextToolbar from "./RichTextToolbar"

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

const RichTextarea = ({ onChange, initialValue }) => {
  const iv: CustomElement[] = initialValue || [
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }],
    },
  ]
  const renderElement = useCallback((props) => <Element {...props} />, [])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
  const [value, setValue] = useState<Descendant[]>(iv)
  const [editor] = useState(() => withReact(createEditor()))

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(v) => {
        setValue(v)
        onChange(v)
      }}
    >
      <RichTextToolbar />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        className="bg-wet-concrete border-concrete border p-2 prose text-marble-white prose-headings:text-marble-white  prose-strong:text-marble-white prose-code:text-marble-white prose-blockquote:text-marble-white prose-headings:m-0 prose-p:m-0 prose-blockquote:m-0"
        placeholder="Enter some rich text…"
      />
    </Slate>
  )
}

export default RichTextarea
