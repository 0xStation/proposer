import { Listbox, Transition } from "@headlessui/react"
import { Safe } from "app/safe/types"
import { Fragment } from "react"
import { Field } from "react-final-form"

export const SelectSafeField = ({
  title,
  subtitle,
  fieldName,
  safes,
}: {
  title: string
  subtitle?: string
  fieldName: string
  safes: string[]
}) => {
  return (
    <>
      <label className="font-bold block mt-6">{title}</label>
      {subtitle && <span className="text-xs text-concrete block">{subtitle}</span>}
      <Field name={fieldName} component="select">
        {({ input }) => (
          // @ts-ignore
          <Listbox value={input.value} onChange={input.onChange} name={input.name}>
            <div className="relative mt-1">
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
                  {safes.map((safeAddress, idx) => (
                    <Listbox.Option
                      key={idx}
                      className={({ active }) =>
                        `relative cursor-default text-marble-white select-none py-2 pl-10 pr-4 ${
                          active ? "bg-electric-violet " : ""
                        }`
                      }
                      value={safeAddress}
                    >
                      {({ selected }) => (
                        <>
                          <span className="block truncate">{safeAddress}</span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center">
                              ✓
                            </span>
                          )}
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
    </>
  )
}

export default SelectSafeField