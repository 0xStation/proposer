import CreatableSelect from "react-select/creatable"
import { Field } from "react-final-form"

// what this component is:
// convenience wrapper over the react-final-form form and react select select.

const customStyles = {
  control: (provided, _state) => ({
    ...provided,
    backgroundColor: "#2E2E2E",
    color: "#646464",
    borderColor: "#646464",
  }),
  menuList: (provided, _state) => ({
    ...provided,
    backgroundColor: "#2E2E2E",
  }),
  option: (provided, _state) => ({
    ...provided,
    backgroundColor: "#2E2E2E",
    color: "#F2EFEF",
    "&:hover": {
      backgroundColor: "#F2EFEF",
      color: "#2E2E2E",
      cursor: "pointer",
    },
  }),
}

const MultiSelectAdapter = ({ input, ...rest }) => (
  <CreatableSelect isMulti {...input} {...rest} styles={customStyles} />
)
const MultiSelect = ({ name, options, placeholder }) => {
  return (
    <Field
      component={MultiSelectAdapter}
      name={name}
      placeholder={placeholder}
      options={options}
    ></Field>
  )
}

export default MultiSelect
