import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XIcon } from "@heroicons/react/outline"
import { formatDate } from "app/core/utils/formatDate"
import getStatusColor from "app/utils/getStatusColor"

const ApplicationDrawer = ({ isOpen, setIsOpen, application }) => {
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
                <div className="flex h-full flex-col overflow-y-scroll bg-tunnel-black border-l border-concrete">
                  <div className="px-4">
                    {application && (
                      <>
                        <div className="flex items-start justify-between w-full">
                          <div className="flex justify-between h-7 items-center w-full">
                            <button
                              type="button"
                              className="rounded-md bg-tunnel-black text-marble-white hover:text-concrete focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => setIsOpen(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XIcon className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="text-concrete text-sm uppercase">
                              submitted on: {formatDate(application.createdAt) || "DATE"}
                            </span>
                          </div>
                          <Dialog.Title className="text-lg font-medium text-marble-white"></Dialog.Title>
                        </div>
                        <div className="flex flex-row justify-between items-center mt-4">
                          <div className="flex flex-row items-center">
                            <img
                              className="h-8 w-8 rounded border border-tunnel-white mr-2"
                              src={application.initiative.terminal.data.pfpURL}
                            />
                            <h3 className="text-marble-white">
                              {application.initiative.terminal.data.name}
                            </h3>
                          </div>
                          <div className="flex flex-row items-center">
                            <span
                              className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(
                                application.status
                              )}`}
                            ></span>
                            <span className="text-marble-white text-xs uppercase tracking-wider">
                              {application.status || "status"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col border-b border-concrete pb-8 mt-8">
                          <span className="text-2xl font-medium text-marble-white">
                            {application.initiative.data.name}
                          </span>
                          <span className="mt-2 text-base text-marble-white">
                            {application.initiative.data.oneLiner}
                          </span>
                        </div>
                        <div className="flex flex-col mt-8">
                          <span className="text-base font-bold text-marble-white">
                            Why Newstand?
                          </span>
                          <span className="mt-2 text-base text-marble-white">
                            {/* note: need optional chaining on entryDescription and url since they can be `null` */}
                            {application?.data?.entryDescription}
                          </span>
                        </div>
                        <div className="flex flex-col border-b border-concrete pb-8 mt-8">
                          <span className="text-base font-bold text-marble-white">Submission</span>
                          <a
                            className="mt-2 text-base text-magic-mint cursor-pointer hover:underline"
                            href={application?.data?.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {application?.data?.url}
                          </a>
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

export default ApplicationDrawer
