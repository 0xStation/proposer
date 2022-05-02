/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from "react"
import { Transition } from "@headlessui/react"
import { CheckCircleIcon } from "@heroicons/react/outline"
import { XIcon } from "@heroicons/react/solid"

const Toast = () => {
  const [show, setShow] = useState(true)

  return (
    <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
      {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
      <Transition
        show={show}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="max-w-sm w-full pointer-events-auto overflow-hidden border border-marble-white">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">Successfully saved!</p>
                <p className="mt-1 text-sm text-concrete">Your roles have been updated.</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}

export default Toast
