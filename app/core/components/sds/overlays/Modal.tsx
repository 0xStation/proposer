import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import Exit from "/public/exit-button.svg"

interface ModalProps {
  /**
   * If the modal is open
   */
  open: boolean
  /**
   * callback to run that triggers the modal open/close
   */
  toggle: (open) => void
  /**
   * Modal contents
   */
  children?: any
  /**
   * Width of the modal, as a tailwind css class (max-w-2xl for example)
   */
  width?: string
}
const Modal = ({ open, toggle, children, width = "max-w-2xl" }: ModalProps) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => toggle(!open)}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-tunnel-black bg-opacity-50" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div
              className={`inline-block w-full ${width} my-8 overflow-hidden rounded text-left align-middle transition-all transform bg-tunnel-black border `}
            >
              <div className="w-full h-full relative">
                <button
                  className="text-marble-white absolute z-50 right-2 top-2"
                  onClick={() => toggle(!open)}
                >
                  <img src="/exit-button.svg" alt="Close button" />
                </button>
              </div>
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Modal
