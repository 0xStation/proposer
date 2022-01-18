import { useQuery } from "blitz"
import CreatableSelect from "react-select/creatable"
import getSkills from "app/skills/queries/getSkills"

const MultiSelect = ({ options }) => {
  // const [skills] = useQuery(getSkills, {}, { suspense: false })
  // let options = skills?.map((skill) => {
  //   return { value: skill.name, label: skill.name }
  // })

  return <CreatableSelect isMulti options={options} />
}

export default MultiSelect
