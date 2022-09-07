import { Field } from "react-final-form"
import { OnChange } from "react-final-form-listeners"

// https://erikras.com/blog/declarative-form-rules
export const WhenFieldChanges = ({ field, set, to }) => (
  <Field name={set} subscription={{}}>
    {(
      // No subscription. We only use Field to get to the change function
      { input: { onChange } }
    ) => (
      <OnChange name={field}>
        {(value) => {
          onChange(to)
        }}
      </OnChange>
    )}
  </Field>
)
export default WhenFieldChanges
