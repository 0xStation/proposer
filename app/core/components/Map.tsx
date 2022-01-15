import { useState } from "react"
import { useQuery } from "blitz"
import { Popover, Transition } from "@headlessui/react"
import ChevronIcon from "../icons/ChevronIcon"
import { Fragment } from "react"
import getTerminals from "app/terminal/queries/getTerminals"

const Map = () => {
  const [page, setPage] = useState(0)
  const [terminals] = useQuery(
    getTerminals,
    { isContributor: false, pagination: { page: page, per_page: 4 } },
    { suspense: false }
  )

  return (
    <div className="w-full max-w-sm px-4">
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button className="text-marble-white group rounded-md h-[28px] inline-flex items-center text-base font-medium">
              <span className="text-marble-white">MAP</span>
              <ChevronIcon isUp={open} className="ml-2" />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 w-[450px] h-[140px] px-4 mt-[9px] right-0 sm:px-0 lg:max-w-3xl">
                <div className="relative right-[-17px] bg-tunnel-black border border-marble-white p-4 h-full">
                  {!terminals ? (
                    "loading"
                  ) : (
                    <>
                      <div className="grid gap-4 grid-cols-4">
                        {terminals.results.map((terminal, idx) => {
                          return (
                            <div key={idx} className="flex flex-col items-center cursor-pointer">
                              <img
                                className="border border-marble-white h-12 w-12 rounded-full bg-concrete"
                                src={terminal.data.pfpURL}
                              />

                              <span className="text-marble-white text-xs mt-1 text-center whitespace-nowrap text-ellipsis overflow-hidden w-full">
                                {terminal.data.name}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex flex-row mx-auto mt-8 justify-center">
                        {[...Array(terminals.pages)].map((_, idx) => {
                          return (
                            <span
                              key={idx}
                              className={`h-1 w-1  rounded-full mr-1 ${
                                page === idx ? "bg-marble-white" : "bg-concrete"
                              }`}
                            ></span>
                          )
                        })}
                      </div>
                      {terminals.hasPrev && (
                        <div
                          onClick={() => setPage(page - 1)}
                          className="cursor-pointer absolute bottom-[10px] left-[10px] rotate-180"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 5.98753L5.97062 -1.05421e-06L5.001 0.974387L9.31593 5.3109L-2.83594e-06 5.3109L-3.07691e-06 6.6891L9.31593 6.6891L5.001 11.0256L5.97061 12L12 5.98753Z"
                              fill="#F2EFEF"
                            />
                          </svg>
                        </div>
                      )}
                      {terminals.hasNext && (
                        <div
                          onClick={() => setPage(page + 1)}
                          className="cursor-pointer absolute bottom-[10px] right-[10px]"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 5.98753L5.97062 -1.05421e-06L5.001 0.974387L9.31593 5.3109L-2.83594e-06 5.3109L-3.07691e-06 6.6891L9.31593 6.6891L5.001 11.0256L5.97061 12L12 5.98753Z"
                              fill="#F2EFEF"
                            />
                          </svg>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}

export default Map
