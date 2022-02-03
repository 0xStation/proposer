import db from "../index"

export async function seedSkills() {
  const skills = [
    "backend",
    "content writing",
    "creative direction",
    "data",
    "design",
    "frontend",
    "hiring",
    "knowledge management",
    "marketing",
    "math",
    "partnership",
    "product strategy",
    "project management",
    "react",
    "solidity",
    "subgraph",
    "storytelling",
    "tokenomics",
    "writing",
  ]
  console.log(skills)

  for (const s in skills) {
    db.skill.upsert({
      where: { name: s.toLowerCase() },
      create: { name: s.toLowerCase() },
      update: { name: s.toLowerCase() },
    })
  }
}
