import db from "../index"

export async function seedSkills() {
  const skills = [
    "backend",
    "content writing",
    "creative direction",
    "data science",
    "design",
    "frontend",
    "hiring",
    "javascript",
    "knowledge management",
    "marketing",
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
      where: { name: s },
      create: { name: s },
      update: { name: s },
    })
  }
}
