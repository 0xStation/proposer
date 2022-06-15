import { Remarkable } from "remarkable"
const md = new Remarkable()

const PreviewEditor = ({ markdown }) => {
  const html = { __html: md.render(markdown) }
  return <div className="markdown-prose" dangerouslySetInnerHTML={html} />
}

export default PreviewEditor
