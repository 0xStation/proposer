import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders"
import { Field } from "react-final-form"

// Custom checkbox style
// look in index.css for custom css rules that were too hard for tailwind
// namely .custom-checkbox and .custom-checkbox-placeholder for conditional rendering
const Checkbox = ({
  name,
  value,
  checked,
  defaultChecked,
  className = "",
}: {
  name: string
  value?: any
  checked?: boolean
  defaultChecked?: boolean
  className?: string
}) => {
  return (
    <Field
      type="checkbox"
      name={name}
      value={value}
      render={({ input, meta }) => (
        <div
          className={`${className} custom-checkbox-container relative inline-block cursor-pointer border border-marble-white p-0.5`}
        >
          <input
            {...input}
            defaultChecked={defaultChecked}
            type="checkbox"
            checked={checked}
            className="custom-checkbox opacity-0 absolute cursor-pointer"
          />
          <span className="custom-checkbox-placeholder h-3 w-3 block bg-tunnel-black"></span>
        </div>
      )}
    />
  )
}

export default Checkbox
