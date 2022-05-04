import { Field } from "react-final-form"

// Custom checkbox style
// look in index.css for custom css rules that were too hard for tailwind
// namely .custom-checkbox and .custom-checkbox-placeholder for conditional rendering
const Checkbox = ({ name, value, checked }: { name: string; value?: string; checked: boolean }) => {
  return (
    <Field
      type="checkbox"
      name={name}
      value={value}
      render={({ input, meta }) => (
        <div className="custom-checkbox-container relative block cursor-pointer border border-marble-white p-0.5">
          <input
            {...input}
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
