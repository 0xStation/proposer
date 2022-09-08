import { Fragment, useState } from "react"
import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/solid"

type ListboxItem = {
  id: number
  name: string
}

type ListboxComponentProps = {
  items: ListboxItem[]
  onChange: (item: ListboxItem) => void
  defaultValue: ListboxItem | undefined
}

const defaultItem = {
  id: -1,
  name: "default",
}

const CustomListbox = ({ items, onChange, defaultValue }: ListboxComponentProps) => {
  const [selected, setSelected] = useState<ListboxItem>(defaultValue || items[0] || defaultItem)
  const onChangeAndSetSelected = (item) => {
    onChange(item)
    setSelected(item)
  }

  return (
    <Listbox value={selected} onChange={onChangeAndSetSelected}>
      <div className="relative w-[200px]">
        <Listbox.Button className="relative w-full cursor-default rounded-md bg-tunnel-black h-[35px] pl-3 pr-10 text-left shadow-md focus:outline-none sm:text-sm border border-marble-white">
          <span className="block truncate text-marble-white">{selected.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-5 w-5 text-marble-white" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-wet-concrete py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
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
                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
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
  )
}

export default CustomListbox
