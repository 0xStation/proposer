import { Remarkable } from "remarkable"
const md = new Remarkable()

const PreviewEditor = ({ markdown, className = "", onClick = () => {} }) => {
  const html = { __html: md.render(markdown) }
  return (
    <div
      className={className + " markdown-prose"}
      dangerouslySetInnerHTML={html}
      onClick={onClick}
    />
  )
}

export default PreviewEditor
