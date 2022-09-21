import ReactSelect from "react-select"
import { Field } from "react-final-form"

// what this component is:
// convenience wrapper over the react-final-form form and react select select.

const customStyles = {
  container: (provided, _state) => ({
    ...provided,
    marginBottom: "20px",
  }),
  control: (provided, _state) => ({
    ...provided,
    backgroundColor: "#2E2E2E", // wet-concrete
    color: "#646464", // concrete
    borderColor: "#646464",
  }),
  menuList: (provided, _state) => ({
    ...provided,
    backgroundColor: "#2E2E2E",
  }),
  singleValue: (provided, _state) => ({
    ...provided,
    color: "#F2EFEF", // marble white
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

const Select = ({
  name,
  options,
  placeholder,
  initialValue,
}: {
  name: string
  options: any[]
  placeholder: string
  initialValue?: any
}) => {
  return (
    <Field
      name={name}
      initialValue={initialValue}
      render={(props) => {
        return (
          <ReactSelect
            {...props.input}
            placeholder={placeholder}
            name={name}
            options={options}
            styles={customStyles}
          />
        )
      }}
    />
  )
}

export default Select
