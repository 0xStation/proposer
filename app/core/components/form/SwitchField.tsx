import { Field } from "react-final-form"
import Switch from "../Switch"

export const SwitchField = ({ title, fieldName }: { title: string; fieldName: string }) => {
  return (
    <div className="mt-6 flex flex-row justify-between items-center">
      <label className="font-bold">{title}</label>
      <Field name={fieldName}>
        {({ input }) => <Switch name={input.name} value={input.value} onChange={input.onChange} />}
      </Field>
    </div>
  )
}

export default SwitchField
