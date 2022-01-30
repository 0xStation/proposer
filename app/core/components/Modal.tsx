import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { Image } from "blitz"
import Exit from "/public/exit-button.svg"

const checkBanner = (picture) => {
  if (picture) {
    return <Image src={picture} alt="Modal banner" layout="responsive" />
  }
}

const Modal = ({
  title,
  open,
  toggle,
  subtitle,
  children,
  banner,
  error,
  showTitle = true,
}: {
  open: boolean
  toggle: (open) => void
  title?: string
  showTitle?: boolean
  subtitle?: string
  children?: any
  banner?: any
  error?: boolean
}) => {
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
            <Dialog.Overlay className="fixed inset-0 bg-marble-white opacity-50" />
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
              className={`inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-tunnel-black border ${
                error ? "border-torch-red" : "border-marble-white"
              }`}
            >
              {showTitle && (
                <div className="w-full h-full relative">
                  <button
                    className="text-marble-white absolute z-50 left-2 top-2"
                    onClick={() => toggle(!open)}
                  >
                    <Image src={Exit} alt="Close button" width={12} height={12} />
                  </button>
                  {checkBanner(banner)}
                </div>
              )}
              <div className="px-4 pt-[3.75rem] pb-4">
                {showTitle && (
                  <Dialog.Title
                    as="h3"
                    className="text-3xl font-medium leading-8 text-marble-white text-center"
                  >
                    {title}
                  </Dialog.Title>
                )}
                {subtitle && (
                  <Dialog.Description className="text-sm font-medium text-marble-white text-center mt-4">
                    {subtitle}
                  </Dialog.Description>
                )}
                {children}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Modal
