import { Remarkable } from "remarkable"
var md = new Remarkable()

const PreviewEditor = ({ markdown }) => {
  const html = { __html: md.render(markdown) }
  return <div className="markdown-prose" dangerouslySetInnerHTML={html} />
}

export default PreviewEditor
