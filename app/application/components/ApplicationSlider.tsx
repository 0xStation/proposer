import { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XIcon } from "@heroicons/react/outline"

const ApplicationSlider = ({ isOpen, setIsOpen, application }) => {
  console.log(application)
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden" onClose={setIsOpen}>
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-tunnel-black bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-2xl">
                <div className="flex h-full flex-col overflow-y-scroll bg-tunnel-black py-6 border-l border-concrete">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex h-7 items-center">
                        <button
                          type="button"
                          className="rounded-md bg-tunnel-black text-marble-white hover:text-concrete focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <Dialog.Title className="text-lg font-medium text-marble-white"></Dialog.Title>
                    </div>
                    {application && (
                      <>
                        <div className="flex flex-col border-b border-concrete pb-8 mb-8">
                          <span className="text-2xl font-medium text-marble-white">
                            {application.initiative.data.name}
                          </span>
                          <span className="mt-2 text-base text-marble-white">
                            {application.initiative.data.oneLiner}
                          </span>
                        </div>
                        <div className="flex flex-col border-b border-concrete pb-8 mb-8">
                          <span className="text-base font-bold text-marble-white">
                            Why Newstand?
                          </span>
                          <span className="mt-2 text-base text-marble-white">
                            {application.data.entryDescription}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default ApplicationSlider
