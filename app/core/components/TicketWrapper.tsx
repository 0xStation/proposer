import { useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"

const TicketWrapper = ({ activeUser, tokenBalance }) => {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setModalOpen(!modalOpen)}
        >
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
              <Dialog.Overlay className="fixed inset-0 bg-marble-white opacity-90" />
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
                className={`inline-block w-full max-w-[240px] my-8 overflow-hidden text-left align-middle transition-all transform`}
              >
                <div className="flex flex-col justify-center">
                  <div>
                    {activeUser?.data.ticketImage ? (
                      <img className="h-[400px] mx-auto block" src={activeUser?.data.ticketImage} />
                    ) : (
                      <div className="h-[400px] w-[240px] border border-concrete rounded-2xl border-dashed text-concrete text-5xl text-center flex flex-col justify-center align-middle mx-auto">
                        FUTURE TICKET GOES HERE
                      </div>
                    )}
                  </div>
                  <div className="mt-2 justify-between px-1 text-base flex">
                    <span className="text-tunnel-black font-bold mr-2">Balance</span>
                    <span className="text-tunnel-black font-light">{tokenBalance} RAIL🅔</span>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <div onClick={() => setModalOpen(true)} className="fixed bottom-4 right-8">
        <div className="flex flex-col items-center">
          <div className=" h-16 w-16 bg-marble-white rounded-full flex items-center justify-center">
            <div className="h-10 w-6 border-2 border-concrete rounded border-dashed flex flex-col items-center"></div>
          </div>
          <div className="mt-2 hidden justify-between px-1 text-sm 2xl:flex">
            <span className="text-marble-white font-bold mr-2">Balance</span>
            <span className="text-marble-white font-light">
              {tokenBalance} RAIL<span className="text-xs">🅔</span>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default TicketWrapper
