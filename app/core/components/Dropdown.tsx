import { Menu, Transition } from "@headlessui/react"
import { Fragment } from "react"

interface DropdownProps {
  button: string | JSX.Element
  items: Link[]
  className: string
}
interface Link {
  name: string
  href: string
}

/**
 * Run of the mill dropdown.
 */
const Dropdown = ({ button, items, className }: DropdownProps) => {
  return (
    <Menu as="div" className={`relative ${className}`}>
      {/* trust me I hate this too but I have to do it for next.js to work.
       it does some annoying image optimization stuff that end up resizing the container.
       see here: https://github.com/vercel/next.js/issues/18915 */}
      <Menu.Button className="block h-[28px]">{button}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="uppercase text-marble-white text-lg absolute left-[-5px] mt-[9px] origin-top-right bg-tunnel-black border border-[#646464] focus:outline-none whitespace-nowrap z-10">
          {items.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) => (
                <a
                  className={`${
                    active ? "" : "text-gray-900"
                  } group flex rounded-md items-center w-full px-2 py-2`}
                  href={item.href}
                >
                  {item.name}
                </a>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default Dropdown
