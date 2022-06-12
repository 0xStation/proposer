import React, { useMemo, useState } from "react"
import { Slate, Editable, withReact } from "slate-react"
import { createEditor, Element as SlateElement, Descendant } from "slate"
import { unified } from "unified"
import markdown from "remark-parse"
import { remarkToSlate, slateToRemark } from "remark-slate-transformer"

const postprocessor = unified().use(markdown).use(remarkToSlate)

const Wrapper = () => {
  const [markdown, setMarkdown] = useState("")
  return (
    <>
      <DemoEditor setMarkdown={setMarkdown} />
      <PreviewEditor markdown={markdown} />
    </>
  )
}

const DemoEditor = ({ setMarkdown }) => {
  return (
    <textarea
      className="bg-tunnel-black w-full p-6 focus:border-0"
      onChange={(e) => setMarkdown(e.target.value.length > 0 ? e.target.value : initialValue)}
    />
  )
}

const PreviewEditor = ({ markdown }) => {
  console.log(markdown)
  const editor = useMemo(() => withReact(createEditor()), [])
  const renderElement = ({ attributes, children, element }: RenderElementProps) => {
    switch (element.type) {
      case "paragraph":
        return (
          <p className="mb-4" {...attributes}>
            {children}
          </p>
        )
      case "heading": {
        switch (element.depth) {
          case 1:
            return (
              <h1 className="font-bold text-3xl" {...attributes}>
                {children}
              </h1>
            )
          case 2:
            return (
              <h2 className="font-bold text-2xl" {...attributes}>
                {children}
              </h2>
            )
          case 3:
            return (
              <h3 className="font-bold text-xl" {...attributes}>
                {children}
              </h3>
            )
          case 4:
            return (
              <h4 className="font-bold text-base" {...attributes}>
                {children}
              </h4>
            )
          case 5:
            return (
              <h5 className="font-bold" {...attributes}>
                {children}
              </h5>
            )
          case 6:
            return (
              <h6 className="font-bold" {...attributes}>
                {children}
              </h6>
            )
          default:
            break
        }
        break
      }
      case "thematicBreak":
        return <hr />
      case "blockquote":
        return (
          <blockquote className="pl-2 border-l-2 border-concrete tobias-italic" {...attributes}>
            {children}
          </blockquote>
        )
      case "list":
        if (element.ordered) {
          return (
            <ol className="list-decimal list-outside pl-8" {...attributes}>
              {children}
            </ol>
          )
        } else {
          return (
            <ul className="list-disc list-outside pl-8" {...attributes}>
              {children}
            </ul>
          )
        }
      case "listItem":
        return (
          <li className="break-all" {...attributes}>
            {element.checked === true ? (
              <input type="checkbox" readOnly checked />
            ) : element.checked === false ? (
              <input type="checkbox" readOnly />
            ) : null}
            {children}
          </li>
        )
      case "table":
        return (
          <table>
            <tbody {...attributes}>{children}</tbody>
          </table>
        )
      case "tableRow":
        return <tr {...attributes}>{children}</tr>
      case "tableCell":
        return <td {...attributes}>{children}</td>
      case "html":
        return (
          <div
            {...attributes}
            dangerouslySetInnerHTML={{
              __html: element.children[0].text as string,
            }}
          />
        )
      case "code":
        return
      case "yaml":
      case "toml":
        return (
          <pre>
            <code {...attributes}>{children}</code>
          </pre>
        )
      case "definition":
        break
      case "footnoteDefinition":
        break
      case "break":
        return <br />
      case "link":
        return (
          <a {...attributes} href={element.url as string} title={element.title as string}>
            {children}
          </a>
        )
      case "image":
        return (
          <>
            <img
              {...attributes}
              src={element.url as string}
              title={element.title as string}
              alt={element.alt as string}
            />
            {children}
          </>
        )
      case "linkReference":
        break
      case "imageReference":
        break
      case "footnote":
        break
      case "footnoteReference":
        break
      default:
        break
    }
    return <p {...attributes}>{children}</p>
  }

  const renderLeaf = ({ attributes, children, leaf }) => {
    if (leaf.strong) {
      children = <strong>{children}</strong>
    }
    if (leaf.emphasis) {
      children = <em>{children}</em>
    }
    if (leaf.delete) {
      children = <del>{children}</del>
    }
    if (leaf.inlineCode) {
      children = <code>{children}</code>
    }
    return <span {...attributes}>{children}</span>
  }

  const slate = postprocessor.processSync(markdown).result
  console.log(slate)
  editor.children = slate

  return (
    <Slate editor={editor} value={[]} onChange={() => {}}>
      <Editable renderElement={renderElement} renderLeaf={renderLeaf} placeholder="preview?" />
    </Slate>
  )
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

export default PreviewEditor
