import db from "db"
import { TerminalMetadata } from "../types"

export default async function getTerminals(input: any) {
  const terminals = await db.terminal.findMany()
  return terminals.filter((t) => !(t.data as TerminalMetadata).hide)
}
