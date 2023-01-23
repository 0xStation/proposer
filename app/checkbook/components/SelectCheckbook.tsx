import { Checkbook } from "app/checkbook/types"
import { Menu, Transition } from "@headlessui/react"
import { Fragment, useEffect, useRef, useState } from "react"
import { ChevronDownIcon } from "@heroicons/react/solid"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"

export const SelectCheckbook = ({
  current,
  checkbooks,
}: {
  current?: Checkbook
  checkbooks: Checkbook[]
}) => {
  const router = useRouter()

  return (
    <Menu as="div" className="relative inline-block text-left w-full">
      <Menu.Button className="inline-flex w-full rounded-md text-lg font-bold items-center justify-between">
        {current ? (
          current?.data.name || "ABC"
        ) : (
          <div
            className={`w-full h-8 rounded-md text-marble-white text-left bg-wet-concrete motion-safe:animate-pulse`}
          ></div>
        )}
        <ChevronDownIcon
          className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
          aria-hidden="true"
        />
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
        <Menu.Items className="absolute bg-wet-concrete text-sm left-0 mt-2 w-full origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            {checkbooks.map((checkbook, idx) => (
              /* Use the `active` state to conditionally style the active item. */
              <Menu.Item key={idx}>
                {({ active }) => (
                  <button
                    className={`text-marble-white ${
                      active && "bg-electric-violet"
                    } group flex w-full items-center rounded-sm px-2 py-2`}
                    onClick={() => {
                      router.push(
                        Routes.CheckbookHome({
                          chainId: checkbook.chainId,
                          address: checkbook.address,
                        })
                      )
                    }}
                  >
                    {checkbook.data.name}
                  </button>
                )}
              </Menu.Item>
            ))}
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`text-marble-white ${
                    active && "bg-electric-violet"
                  } group flex w-full items-center rounded-sm px-2 py-2`}
                  onClick={() => {
                    console.log("+ Add checkbook")
                  }}
                >
                  + Add checkbook
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default SelectCheckbook
