import ReactSelect from "react-select"
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
  singleValue: (provided, _state) => ({
    ...provided,
    color: "#F2EFEF",
  }),
  input: (provided, _state) => ({
    ...provided,
    color: "#F2EFEF",
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

const SelectAdaptor = ({ input, ...rest }) => (
  <ReactSelect {...input} {...rest} styles={customStyles} />
)

const Select = ({ name, options, placeholder }) => {
  return (
    <Field
      component={SelectAdaptor}
      name={name}
      placeholder={placeholder}
      options={options}
    ></Field>
  )
}

export default Select
