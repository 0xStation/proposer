import { Listbox, Transition } from "@headlessui/react"
import { Safe } from "app/safe/types"
import { Fragment } from "react"
import { Field } from "react-final-form"

export const SelectField = ({ fieldName, options }: { fieldName: string; options: string[] }) => {
  return (
    <Field name={fieldName} component="select">
      {({ input }) => (
        // @ts-ignore
        <Listbox value={input.value} onChange={input.onChange} name={input.name}>
          <div className="relative mt-1 w-full">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-wet-concrete py-2 pl-3 pr-10 text-left">
              <span className="block truncate">{input.value || "Select one"}</span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="z-20 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-wet-concrete py-1 text-base">
                {options.map((option, idx) => (
                  <Listbox.Option
                    key={idx}
                    className={({ active }) =>
                      `relative cursor-default text-marble-white select-none py-2 pl-3 pr-4 ${
                        active ? "bg-electric-violet " : ""
                      }`
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <>
                        <span className="block truncate">{option}</span>
                        {/* {selected && (
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center">
                            ✓
                          </span>
                        )} */}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      )}
    </Field>
  )
}

export default SelectField
