import { useState } from "react"
import { useQuery } from "blitz"
import { Dialog, Transition } from "@headlessui/react"
import getTicket from "app/ticket/queries/getTicket"
import { Fragment } from "react"

const TicketWrapper = ({ activeUser, tokenBalance, terminal, endorsementsSymbol }) => {
  const [ticket] = useQuery(
    getTicket,
    { terminalId: terminal.id, accountId: activeUser.id },
    { suspense: false }
  )

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
              <Dialog.Overlay className="fixed inset-0 bg-tunnel-black opacity-70" />
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
                className={`inline-block w-full max-w-[1000px] my-8 overflow-hidden text-left align-middle transition-all transform`}
              >
                <div className="flex flex-row space-x-24 items-center">
                  <div className="flex flex-col justify-center">
                    <div className="bg-concrete min-w-[400px]">
                      {ticket?.data.ticketImageUrl ? (
                        <img
                          className="h-[400px] mx-auto block"
                          src={ticket?.data.ticketImageUrl}
                        />
                      ) : (
                        <p className="h-[400px] w-[240px] border border-concrete rounded-2xl border-dashed text-concrete text-3xl text-center flex flex-col justify-center align-middle mx-auto bg-tunnel-black">
                          FUTURE CONTRIBUTOR ID GOES HERE
                        </p>
                      )}
                    </div>
                    <div className="w-full mt-2 justify-between px-1 text-base flex mx-auto">
                      <span className="text-marble-white font-bold mr-2">Balance</span>
                      <span className="text-marble-white font-light">
                        {tokenBalance} {endorsementsSymbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-marble-white text-2xl">
                      <span className="text-neon-blue">
                        {terminal.data.contracts.symbols.endorsements}
                      </span>{" "}
                      gives you the power to signal your support for prospective contributors and
                      curate the <span className="text-neon-blue">{terminal.data.name}</span>{" "}
                      community.{" "}
                    </p>
                    <p className="mt-8 text-marble-white text-2xl">
                      The balance is granted based on your role in the organization. It gets
                      replenished when <span className="text-neon-blue">{terminal.data.name}</span>{" "}
                      open up more initiatives for submissions.
                    </p>
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
              {tokenBalance} {endorsementsSymbol}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default TicketWrapper
