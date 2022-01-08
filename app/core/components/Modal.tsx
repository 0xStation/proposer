import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { Image } from "blitz"

const Modal = ({
  title,
  open,
  toggle,
  subtitle,
  children,
  banner,
}: {
  title: string
  open: boolean
  toggle: React.Dispatch<React.SetStateAction<boolean>>
  subtitle?: string
  children?: any
  banner?: any
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
            <Dialog.Overlay className="fixed inset-0 bg-tunnel-black opacity-50" />
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
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-tunnel-black border border-marble-white">
              {/* <Image src={banner} alt="Modal banner" width={620} height={200} /> */}
              <Dialog.Title
                as="h3"
                className="text-3xl font-medium leading-8 text-marble-white text-center"
              >
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm font-medium text-marble-white text-center mt-4">
                {subtitle}
              </Dialog.Description>
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Modal
