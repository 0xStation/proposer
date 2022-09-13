import { Fragment, useState, useEffect } from "react"
import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon } from "@heroicons/react/solid"
import NoSsr from "app/core/components/NoSsr"
import DropdownChevronIcon from "../icons/DropdownChevronIcon"

type ListboxItem = {
  id: number
  name: string
}

type ListboxError = {
  message: string
}

type ListboxComponentProps = {
  items: ListboxItem[]
  onChange: (item: ListboxItem) => boolean
  defaultValue: ListboxItem | undefined
  error?: ListboxError
}

const defaultListboxItem = {
  id: -1,
  name: "string",
}

const CustomListbox = ({ items, onChange, defaultValue, error }: ListboxComponentProps) => {
  const [selected, setSelected] = useState<ListboxItem>(
    defaultValue || items[0] || defaultListboxItem
  )
  const onChangeAndSetSelected = (item) => {
    const shouldContinue = onChange(item)
    if (shouldContinue) {
      setSelected(item)
    }
  }

  useEffect(() => {
    if (defaultValue) {
      setSelected(defaultValue)
    }
  }, [defaultValue])

  return (
    <NoSsr>
      <Listbox value={selected} onChange={onChangeAndSetSelected}>
        <div
          className={`relative w-[175px] rounded-md border ${
            error
              ? "border-torch-red bg-torch-red text-tunnel-black"
              : "border-marble-white text-marble-white"
          }`}
        >
          <Listbox.Button className="relative w-full cursor-default h-[35px] pl-3 pr-10 text-left shadow-md focus:outline-none sm:text-sm">
            <span className="block truncate font-bold text-base">
              {error ? error.message : selected.name}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <DropdownChevronIcon className={error ? "text-tunnel-black" : "text-marble-white"} />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-wet-concrete py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 text-marble-white">
              {items.map((item, itemIdx) => (
                <Listbox.Option
                  key={itemIdx}
                  className={({ active, selected }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active || selected ? "bg-electric-violet" : "text-gray-900"
                    }`
                  }
                  value={item}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                      >
                        {item.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-marble-white">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </NoSsr>
  )
}

export default CustomListbox
