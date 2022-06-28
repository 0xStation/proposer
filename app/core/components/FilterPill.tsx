import { Menu, Transition } from "@headlessui/react"
import Checkbox from "app/core/components/form/Checkbox"
import { useState, Fragment } from "react"
import { Form } from "react-final-form"
import DropdownChevronIcon from "../icons/DropdownChevronIcon"

interface FilterValue {
  name: string
  value: string
}

const FilterPill = ({
  label,
  filterValues,
  appliedFilters,
  setAppliedFilters,
  setPage,
  refetchCallback,
}: {
  label: string
  filterValues: FilterValue[]
  appliedFilters: Set<any>
  setAppliedFilters: React.Dispatch<React.SetStateAction<Set<any>>>
  setPage?: React.Dispatch<React.SetStateAction<number>>
  refetchCallback: () => void
}) => {
  const [clearDefaultValue, setClearDefaultValue] = useState<boolean>(false)

  const handleClearFilters = (e) => {
    e.preventDefault()

    appliedFilters.clear()

    if (setPage) {
      setPage(0)
    }

    setAppliedFilters(appliedFilters)
    refetchCallback()

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
            <Menu.Button className="block h-[28px] text-marble-white">
              <div className="flex items-center">
                <span
                  className={`${
                    open
                      ? "bg-marble-white text-tunnel-black  border-marble-white"
                      : "hover:bg-marble-white hover:text-tunnel-black border-concrete hover:border-marble-white"
                  } capitalize group rounded-full border h-[17px] w-max p-4 flex flex-center items-center cursor-pointer `}
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
                      const filterValue = key.slice(3)
                      if (fieldIsChecked) {
                        appliedFilters.add(filterValue)
                      } else {
                        appliedFilters.delete(filterValue)
                      }
                    })
                    if (setPage) {
                      setPage(0)
                    }
                    setAppliedFilters(appliedFilters)
                    refetchCallback()
                  }}
                  render={({ form, handleSubmit }) => {
                    return (
                      <form onSubmit={handleSubmit}>
                        <div className="mt-[1.4rem] mx-[1.15rem] mb-5 space-y-3">
                          {filterValues.map((filterVal) => {
                            return (
                              <div
                                className="flex-row"
                                key={`${clearDefaultValue}${filterVal.value}`}
                              >
                                <Checkbox
                                  name={`key${filterVal.value}`}
                                  defaultChecked={appliedFilters.has(filterVal.value)}
                                  className="align-middle"
                                />
                                <p className="p-0.5 align-middle mx-4 inline leading-none">
                                  {filterVal.name}
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
