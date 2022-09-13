import { Menu, Transition } from "@headlessui/react"
import Checkbox from "app/core/components/form/Checkbox"
import { useState, Fragment } from "react"
import { Form } from "react-final-form"
import DropdownChevronIcon from "../icons/DropdownChevronIcon"

interface FilterOption {
  name: string
  value: string
}

/**
 * Filter on a list of options.
 * Any option value that is checked on the UI will be inclusively added to the `appliedFilters` Set.
 * @param {string} label - The descriptor of the filter that will be visually shown to the user.
 * @param {Object} filterOptions - The options rendered on the filter. Options incldue a name and value, where the name
 * is the display name of the option and the value is what gets added to the `appliedFilters` Set.
 * @param {Set} appliedFilters - A Set including the values of the checked options.
 * @param {React.Dispatch<React.SetStateAction<Set<string>>>} setAppliedFilters - Set state action that applies the filter values to the parent component (usually the page).
 * @callback refetchCallback - An optional callback used to refresh data after new filter values are applied.
 */
const FilterPill = ({
  label,
  filterOptions,
  appliedFilters,
  setAppliedFilters,
  refetchCallback, // callback if any queries need to be re-run when filters are applied
}: {
  label: string
  filterOptions: FilterOption[]
  appliedFilters: Set<string>
  setAppliedFilters: React.Dispatch<React.SetStateAction<Set<string>>>
  setPage?: React.Dispatch<React.SetStateAction<number>>
  refetchCallback?: () => void
}) => {
  const [clearDefaultValue, setClearDefaultValue] = useState<boolean>(false)

  const handleClearFilters = (e) => {
    e.preventDefault()

    appliedFilters.clear()

    setAppliedFilters(appliedFilters)
    if (refetchCallback) {
      refetchCallback()
    }

    // clear filled checkboxes by removing the defaultChecked value
    // bumping the key will reset the uncontrolled component's internal state
    setClearDefaultValue(true)
  }

  return (
    <Menu as="div" className="relative mb-2 sm:mb-0">
      {({ open }) => {
        setClearDefaultValue(false)
        return (
          <>
            <Menu.Button className="block text-marble-white">
              <div className="flex items-center">
                <span
                  className={`${
                    open
                      ? "bg-marble-white text-tunnel-black  border-marble-white"
                      : "hover:bg-marble-white hover:text-tunnel-black border-concrete hover:border-marble-white"
                  } capitalize group rounded-full border w-max px-2 py-1 flex flex-center items-center cursor-pointer `}
                >
                  {label} {appliedFilters && appliedFilters.size ? `(${appliedFilters.size})` : ""}
                  <div className="ml-3">
                    <DropdownChevronIcon
                      className={`${open ? "fill-tunnel-black" : "group-hover:fill-tunnel-black"}`}
                    />
                  </div>
                </span>
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute origin-top-left mt-5 h-auto w-[11rem] sm:w-[22rem] bg-tunnel-black border border-concrete rounded-md z-10">
                <Form
                  onSubmit={(fields) => {
                    if (!fields || !Object.keys(fields).length || !Object.keys(fields)[0]) {
                      return
                    }
                    // grab field selected
                    Object.entries(fields).map(([key, fieldIsChecked]) => {
                      // Re: slice() usage -> see comment on the `Checkbox`'s field name value.
                      // tldr; we can't have numbers as field names and need to add extra letters
                      // in front of number values to prevent an error being thrown.
                      const filterValue = key.slice(3)
                      if (fieldIsChecked) {
                        appliedFilters.add(filterValue)
                      } else {
                        appliedFilters.delete(filterValue)
                      }
                    })

                    setAppliedFilters(appliedFilters)

                    if (refetchCallback) {
                      refetchCallback()
                    }
                  }}
                  render={({ form, handleSubmit }) => {
                    return (
                      <form onSubmit={handleSubmit}>
                        <div className="mt-[1.4rem] mx-[1.15rem] mb-5 space-y-3">
                          {filterOptions.map((option) => {
                            return (
                              <div className="flex-row" key={`${clearDefaultValue}${option.value}`}>
                                <Checkbox
                                  // In the submit function, the form's `fields` are inputted
                                  // as an object where the keys are the name of the touched fields and
                                  // the values are booleans indicating whether the fields are
                                  // checked or not. One issue is that you can't add numbers as field names
                                  // (even if stringifed) which we are doing for `tagIds` on the member directory page.
                                  // You will receive the message: `Error: Cannot set a numeric property on an object`.
                                  // This is due to a limitation on how react-final-form parses the field names.
                                  // See issue on react-final-form github: https://github.com/final-form/final-form/issues/103.
                                  // The solution is to add words/letters to the field name and parse the field value
                                  // from the extraneous words/letters. Here we are using the word "key" in front of the value.
                                  name={`key${option.value}`}
                                  defaultChecked={appliedFilters.has(option.value)}
                                  className="align-middle"
                                />
                                <p className="p-0.5 align-middle mx-4 inline leading-none">
                                  {option.name}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                        <button
                          type="submit"
                          className="bg-marble-white w-36 sm:w-52 h-[35px] text-tunnel-black rounded mb-4 ml-4 mr-1 hover:opacity-70"
                        >
                          Apply
                        </button>
                        <button
                          className="w-[6.5rem] hover:text-concrete mb-2 sm:mb-0"
                          onClick={(e) => {
                            handleClearFilters(e)
                            form.reset()
                          }}
                        >
                          Clear all
                        </button>
                      </form>
                    )
                  }}
                ></Form>
              </Menu.Items>
            </Transition>
          </>
        )
      }}
    </Menu>
  )
}

export default FilterPill
