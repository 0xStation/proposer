import db from "db"

// annoyingly does not let you pass no input
export default async function getTerminalById(input) {
  const skills = await db.skill.findMany()
  return skills
}
