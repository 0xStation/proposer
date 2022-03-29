import { Menu, Transition } from "@headlessui/react"
import { Fragment } from "react"
import ChevronIcon from "../icons/ChevronIcon"

interface DropdownProps {
  button: string | JSX.Element
  items: Link[]
  side: "right" | "left"
  className?: string
}
interface Link {
  name: string
  href?: string
  onClick?: () => void
}

/**
 * Run of the mill dropdown.
 */
const Dropdown = ({ button, items, side, className }: DropdownProps) => {
  return (
    <Menu as="div" className={`relative ${className} origin-top `}>
      {({ open }) => (
        <>
          <Menu.Button className="block h-[28px] text-marble-white">
            <div className="flex items-center">
              {button} <ChevronIcon isUp={open} className="ml-2" />
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
            <Menu.Items
              className={`${
                side === "left" ? `left-[10px]` : `right-[2px]`
              } uppercase text-marble-white text-lg origin-top mt-[9px] absolute bg-tunnel-black border border-[#646464] whitespace-nowrap z-10`}
            >
              {items.map((item) => (
                <Menu.Item key={item.name}>
                  {() => (
                    <a
                      className={`hover:bg-wet-concrete group flex items-center w-full px-4 py-2 cursor-pointer`}
                      href={item.href}
                      onClick={item.onClick}
                    >
                      {item.name}
                    </a>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default Dropdown
