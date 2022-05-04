// single toast vs multi?
import { Fragment, useState } from "react"
import { Transition } from "@headlessui/react"
import { CheckCircleIcon } from "@heroicons/react/outline"
import { Image } from "blitz"
import Exit from "/public/exit-button.svg"

type Toast = {
  message: string
}

const useToast: () => [(msg: any) => void, () => JSX.Element] = () => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()
  const [toast, setToast] = useState<Toast>()
  const [showToast, setShowToast] = useState<boolean>(false)

  // used to set the toast message
  const addToast = (msg) => {
    setToast({
      message: msg,
    })

    setShowToast(true)
    const timeoutId = setTimeout(() => {
      setShowToast(false)
    }, 3000)
    setTimeoutId(timeoutId)
  }

  const Toast = () => (
    <div
      aria-live="assertive"
      className="fixed bottom-0 right-0 left-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={showToast}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-300"
          leaveFrom="translate-y-0 opacity-100 sm:translate-x-0"
          leaveTo="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          appear
        >
          <div className="max-w-sm w-full pointer-events-auto overflow-hidden border border-concrete rounded">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-bold text-gray-900">Successfully saved!</p>
                  <p className="mt-1 text-sm">{toast && toast.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => {
                      timeoutId && clearTimeout(timeoutId)
                      setShowToast(false)
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <Image src={Exit} alt="Close button" width={12} height={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  )

  return [addToast, Toast]
}

export default useToast
