import db from "../index"

export async function seedSkills() {
  const skills = await db.skill.createMany({
    data: [{ name: "Javascript" }, { name: "React" }, { name: "Figma" }, { name: "Storytelling" }],
  })

  console.log(skills)
  console.log("creating skills")
}
