import Prism from "prismjs"
import React, { useCallback, useMemo } from "react"
import { Slate, Editable, withReact, ReactEditor } from "slate-react"
import {
  Text,
  Editor,
  Transforms,
  Range,
  Point,
  createEditor,
  Element as SlateElement,
  Descendant,
  BaseEditor,
} from "slate"

type BulletedListElement = {
  type: "bulleted-list"
  align?: string
  children: Descendant[]
}

export type CustomText = { text: string }
type CustomElement = { type: string; children: Descendant[] }

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

const SHORTCUTS = {
  "*": "list-item",
  "-": "list-item",
  "+": "list-item",
  ">": "block-quote",
  "#": "heading-one",
  "##": "heading-two",
  "###": "heading-three",
  "####": "heading-four",
  "#####": "heading-five",
  "######": "heading-six",
}

const TRANSFORMS = {
  "*": "bold",
  _: "italic",
}

// eslint-disable-next-line
Prism.languages.markdown=Prism.languages.extend("markup",{}),Prism.languages.insertBefore("markdown","prolog",{blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},code:[{pattern:/^(?: {4}|\t).+/m,alias:"keyword"},{pattern:/``.+?``|`[^`\n]+`/,alias:"keyword"}],title:[{pattern:/\w+.*(?:\r?\n|\r)(?:==+|--+)/,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#+.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^\*\*|^__|\*\*$|__$/}},italic:{pattern:/(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*_]|[*_]$/}},url:{pattern:/!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,inside:{variable:{pattern:/(!?\[)[^\]]+(?=\]$)/,lookbehind:!0},string:{pattern:/"(?:\\.|[^"\\])*"(?=\)$)/}}}}),Prism.languages.markdown.bold.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.italic.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.bold.inside.italic=Prism.util.clone(Prism.languages.markdown.italic),Prism.languages.markdown.italic.inside.bold=Prism.util.clone(Prism.languages.markdown.bold); // prettier-ignore

const MarkdownShortcutsExample = () => {
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
  const renderElement = useCallback((props) => <Element {...props} />, [])
  const editor = useMemo(() => withShortcuts(withReact(createEditor())), [])
  const decorate = useCallback(([node, path]) => {
    const ranges: {
      anchor: {
        path: any
        offset: number
      }
      focus: {
        path: any
        offset: number
      }
    }[] = []

    if (!Text.isText(node)) {
      return ranges
    }

    const getLength = (token) => {
      if (typeof token === "string") {
        return token.length
      } else if (typeof token.content === "string") {
        return token.content.length
      } else {
        return token.content.reduce((l, t) => l + getLength(t), 0)
      }
    }

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown)
    let start = 0

    for (const token of tokens) {
      const length: number = getLength(token)
      const end = start + length

      if (typeof token !== "string") {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        })
      }

      start = end
    }

    return ranges
  }, [])
  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={() => {
        // pass
      }}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        decorate={decorate}
        placeholder="Write some markdown..."
        autoFocus
      />
    </Slate>
  )
}

const withShortcuts = (editor) => {
  const { deleteBackward, insertText } = editor
  let inTransform = false
  let activeTransform = {
    type: "bold",
  }

  editor.insertText = (text) => {
    const { selection } = editor

    // if (TRANSFORMS[text]) {
    //   if (inTransform) {
    //     if (TRANSFORMS[text] === activeTransform.type) {

    //     }
    //   }
    //   inTransform = true
    //   activeTransform.type = TRANSFORMS[text]
    // }

    if (text === " " && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const beforeText = Editor.string(editor, range)
      const type = SHORTCUTS[beforeText]

      if (type) {
        Transforms.select(editor, range)
        Transforms.delete(editor)
        const newProperties: Partial<SlateElement> = {
          type,
        }
        Transforms.setNodes<SlateElement>(editor, newProperties, {
          match: (n) => Editor.isBlock(editor, n),
        })

        if (type === "list-item") {
          const list: BulletedListElement = {
            type: "bulleted-list",
            children: [],
          }
          Transforms.wrapNodes(editor, list, {
            match: (n) =>
              !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "list-item",
          })
        }

        return
      }
    }

    insertText(text)
  }

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      })

      if (match) {
        const [block, path] = match
        const start = Editor.start(editor, path)

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== "paragraph" &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<SlateElement> = {
            type: "paragraph",
          }
          Transforms.setNodes(editor, newProperties)

          if (block.type === "list-item") {
            Transforms.unwrapNodes(editor, {
              match: (n) =>
                !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "bulleted-list",
              split: true,
            })
          }

          return
        }
      }

      deleteBackward(...args)
    }
  }

  return editor
}

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote className="pl-2 border-l-2 border-concrete tobias-italic" {...attributes}>
          {children}
        </blockquote>
      )
    case "bulleted-list":
      return (
        <ul className="list-disc list-inside" {...attributes}>
          {children}
        </ul>
      )
    case "heading-one":
      return (
        <h1 className="font-bold text-3xl" {...attributes}>
          {children}
        </h1>
      )
    case "heading-two":
      return (
        <h2 className="font-bold text-2xl" {...attributes}>
          {children}
        </h2>
      )
    case "heading-three":
      return (
        <h3 className="font-bold text-xl" {...attributes}>
          {children}
        </h3>
      )
    case "heading-four":
      return <h4 {...attributes}>{children}</h4>
    case "heading-five":
      return <h5 {...attributes}>{children}</h5>
    case "heading-six":
      return <h6 {...attributes}>{children}</h6>
    case "list-item":
      return <li {...attributes}>{children}</li>
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Leaf = ({ attributes, children, leaf }) => {
  return (
    <span
      {...attributes}
      className={`
    ${leaf.bold ? "font-bold" : ""}
    ${leaf.italic ? "italic" : ""}
    ${leaf.title ? "text-2xl font-bold inline-block" : ""}
    ${leaf.hr ? "border-b-2 border-concrete block text-center" : ""}
    ${leaf.underlined ? "underline" : ""}
    ${leaf.blockquote ? "pl-2 border-l-2 border-concrete inline-block tobias-italic" : ""}
    ${leaf.code ? "font-mono bg-wet-concrete p-2 rounded" : ""}
  `}
    >
      {children}
    </span>
  )
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
]

export default MarkdownShortcutsExample
