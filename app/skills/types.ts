export type Skill = {
  id: number
  name: string
}

export type InitiativeSkill = {
  initiativeId: number
  skillId: number
  skill: Skill
}
