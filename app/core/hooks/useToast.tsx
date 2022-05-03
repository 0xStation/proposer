// single toast vs multi?
import { Fragment, useState } from "react"
import { Transition } from "@headlessui/react"
import { CheckCircleIcon } from "@heroicons/react/outline"
import { XIcon } from "@heroicons/react/solid"

type Toast = {
  message: string
}

const useToast: () => [(msg: any) => void, () => JSX.Element] = () => {
  const [toId, setToId] = useState<NodeJS.Timeout>()
  const [t, setT] = useState<Toast>()
  const [show, setShow] = useState<boolean>(false)

  // used to set the toast message
  const toast = (msg) => {
    setT({
      message: msg,
    })

    // toId is the timeoutId, required so if the user closes the toast manually,
    // it also clears the timeout value
    setShow(true)
    const timeoutId = setTimeout(() => {
      setShow(false)
    }, 3000)
    setToId(timeoutId)
  }

  const Toast = () => (
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
        <div className="max-w-sm w-full pointer-events-auto overflow-hidden border border-concrete">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">Successfully saved!</p>
                <p className="mt-1 text-sm text-concrete">{t && t.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => {
                    toId && clearTimeout(toId)
                    setShow(false)
                  }}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )

  return [toast, Toast]
}

export default useToast
