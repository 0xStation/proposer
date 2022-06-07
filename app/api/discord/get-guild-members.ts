import * as z from "zod"
import { getGuildMembers } from "app/utils/getGuildMembers"

const GetGuildMembers = z.object({
  guildId: z.string(),
})

export default async function handler(req, res) {
  const guildId = GetGuildMembers.parse(req.body)

  try {
    const guildMembers = await getGuildMembers(guildId)
    res.status(200).json({ guildMembers })
    return
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: err })
  }
}
