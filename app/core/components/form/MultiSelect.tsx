import CreatableSelect from "react-select/creatable"
import { components } from "react-select"
import { Field } from "react-final-form"

// what this component is:
// convenience wrapper over the react-final-form form and react select select.

const MAX_NUMBER_OF_SKILLS = 5

const Menu = (props) => {
  const optionSelectedLength = props.getValue().length || 0
  return (
    <components.Menu {...props}>
      {optionSelectedLength < 5 ? (
        props.children
      ) : (
        <div className="m-2 text-torch-red bg-wet-concrete">
          You can only select up to {MAX_NUMBER_OF_SKILLS} skills
        </div>
      )}
    </components.Menu>
  )
}

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#2E2E2E",
    color: "#646464",
    borderColor: "#646464",
  }),
  menu: (provided, state) => ({
    ...provided,
    backgroundColor: "#2E2E2E",
  }),
  menuList: (provided, state) => ({
    ...provided,
    backgroundColor: "#2E2E2E",
  }),
  option: (provided, state) => ({
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
  <CreatableSelect
    components={{ Menu }}
    isValidNewOption={(inputValue, selectValue) =>
      inputValue.length > 0 && selectValue.length < MAX_NUMBER_OF_SKILLS
    }
    isMulti
    {...input}
    {...rest}
    styles={customStyles}
  />
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
