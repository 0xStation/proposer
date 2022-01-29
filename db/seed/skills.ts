import db from "../index"

export async function seedSkills() {
  const skills = ["Javascript", "React", "Figm", "Storytelling"]
  console.log(skills)

  for (const s in skills) {
    db.skill.upsert({
      where: { name: s },
      create: { name: s },
      update: { name: s },
    })
  }
}
