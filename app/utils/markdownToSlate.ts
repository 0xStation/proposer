import markdown from "remark-parse"
import { unified } from "unified"
import { remarkToSlate } from "remark-slate-transformer"
import { Descendant } from "slate"

export const markdownToSlate = (markdownString: string) => {
  const postprocessor = unified().use(markdown).use(remarkToSlate)
  return postprocessor.processSync(markdownString).result as Descendant[]
}
