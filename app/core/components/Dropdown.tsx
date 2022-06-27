import { Menu, Transition } from "@headlessui/react"
import { Fragment } from "react"

interface DropdownProps {
  button: string | JSX.Element
  items: Link[]
  side?: "right" | "left"
  className?: string
}
interface Link {
  name: JSX.Element
  href?: string
  onClick?: () => void
}

/**
 * Run of the mill dropdown.
 */
const Dropdown = ({ button, items, side, className }: DropdownProps) => {
  return (
    <Menu as="div" className={`${className}`}>
      {({ open }) => (
        <>
          <Menu.Button className="relative text-marble-white">{button}</Menu.Button>
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
                side && side === "left" ? `left-[10px]` : `right-[40px]`
              } text-marble-white origin-top absolute mt-1 bg-tunnel-black border border-wet-concrete rounded whitespace-nowrap z-10 drop-shadow-lg`}
            >
              {items.map((item, idx) => (
                <Menu.Item key={idx}>
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
