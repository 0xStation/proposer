import db from "db"

export default async function getTerminals(input: any) {
  const terminals = await db.terminal.findMany()
  return terminals
}
