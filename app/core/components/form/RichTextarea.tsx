import React, { useState, useCallback } from "react"
import {
  Editor,
  createEditor,
  BaseEditor,
  Descendant,
  Transforms,
  Element as SlateElement,
} from "slate"
import { useSlate, Slate, Editable, withReact, ReactEditor } from "slate-react"
import { XIcon } from "@heroicons/react/outline"
import { CustomElement, CustomText } from "app/initiative/types"

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

const LIST_TYPES = ["numbered-list", "bulleted-list"]

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
      <div
        className={`bg-wet-concrete border-concrete flex flex-col border-l border-r border-t mt-0.5 w-full overflow-scroll relative`}
      >
        <ul className="px-1 flex items-center sticky top-0 bg-white z-1 h-[33px]">
          <li>
            <MarkButton format="bold" icon={<XIcon className="h-4 w-4" aria-hidden="true" />} />
          </li>
          <li>
            <MarkButton format="italic" icon={<XIcon className="h-4 w-4" aria-hidden="true" />} />
          </li>
          <li>
            <MarkButton
              format="underline"
              icon={<XIcon className="h-4 w-4" aria-hidden="true" />}
            />
          </li>
          <li>
            <MarkButton format="code" icon={<XIcon className="h-4 w-4" aria-hidden="true" />} />
          </li>
          <li>
            <BlockButton
              format="heading-one"
              icon={<XIcon className="h-4 w-4" aria-hidden="true" />}
            />
          </li>
          <li>
            <BlockButton
              format="heading-two"
              icon={<XIcon className="h-4 w-4" aria-hidden="true" />}
            />
          </li>
          <li>
            <BlockButton
              format="block-quote"
              icon={<XIcon className="h-4 w-4" aria-hidden="true" />}
            />
          </li>
          <li>
            <BlockButton
              format="numbered-list"
              icon={<XIcon className="h-4 w-4" aria-hidden="true" />}
            />
          </li>
          <li>
            <BlockButton
              format="bulleted-list"
              icon={<XIcon className="h-4 w-4" aria-hidden="true" />}
            />
          </li>
        </ul>
      </div>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        className="bg-wet-concrete border-concrete border p-2 block min-h-36 prose text-marble-white prose-h1:text-marble-white prose-h2:text-marble-white"
        placeholder="Enter some rich text…"
      />
    </Slate>
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

interface BaseProps {
  className: string
  [key: string]: unknown
}
type OrNull<T> = T | null

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

export default RichTextarea
