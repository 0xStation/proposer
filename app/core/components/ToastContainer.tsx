import { Fragment, useState, useEffect } from "react"
import useStore from "../hooks/useStore"
import { CheckCircleIcon, EmojiSadIcon } from "@heroicons/react/outline"
import { Image } from "blitz"
import Exit from "/public/exit-button.svg"
import { Transition } from "@headlessui/react"

const ToastContainer = () => {
  const { isToastShowing, type, message } = useStore((state) => state.toastState)
  const setToastState = useStore((state) => state.setToastState)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()

  const toastColor = type === "success" ? "text-magic-mint" : "text-torch-red"

  useEffect(() => {
    if (isToastShowing) {
      setTimeoutId(
        setTimeout(() => {
          setToastState({ isToastShowing: false, type, message: "" })
        }, 3000)
      )
    }
  }, [isToastShowing])

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-0 right-0 left-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={isToastShowing}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-300"
          leaveFrom="translate-y-0 opacity-100 sm:translate-x-0"
          leaveTo="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          as={Fragment}
          appear
        >
          <div className="max-w-sm w-full pointer-events-auto overflow-hidden border border-concrete rounded">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {type === "success" ? (
                    <CheckCircleIcon className="h-6 w-6 stroke-magic-mint" aria-hidden="true" />
                  ) : (
                    <EmojiSadIcon className="h-6 w-6 stroke-torch-red" aria-hidden="true" />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-bold ${toastColor}`}>
                    {type === "success" ? "Success" : "Error"}
                  </p>
                  <p className={`mt-1 text-sm ${toastColor}`}>{message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => {
                      if (timeoutId) {
                        clearTimeout(timeoutId)
                      }
                      setToastState({ isToastShowing: false, type: "success", message: "" })
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
}

export default ToastContainer
