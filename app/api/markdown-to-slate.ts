import markdown from "remark-parse"
import { unified } from "unified"
import { remarkToSlate } from "remark-slate-transformer"
import { Descendant } from "slate"

export default async function handler(req, res) {
  const postprocessor = unified().use(markdown).use(remarkToSlate)
  const slate = postprocessor.processSync(req.body.markdownString).result as Descendant[]
  res.status(200).json({ slate })
}
