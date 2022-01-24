import { useState } from "react"
import { useQuery } from "blitz"
import { Popover, Transition } from "@headlessui/react"
import ChevronIcon from "../icons/ChevronIcon"
import { Fragment } from "react"
import getTerminals from "app/terminal/queries/getTerminals"
import getTerminalsByAccount from "app/terminal/queries/getTerminalsByAccount"
import useStore from "app/core/hooks/useStore"
import { Account } from "app/account/types"
import usePagination from "app/core/hooks/usePagination"

const Map = () => {
  const activeUser: Account | null = useStore((state) => state.activeUser)
  const [contributorBoolean, setContributorBoolean] = useState(false)
  const [page, setPage] = useState(0)
  const [terminals] = useQuery(getTerminals, {}, { suspense: false })

  const [contributorTerminals = []] = useQuery(
    getTerminalsByAccount,
    { address: activeUser?.address },
    { suspense: false }
  )

  const data = contributorBoolean ? contributorTerminals : terminals
  const { results, totalPages, hasNext, hasPrev } = usePagination(data, page, 4)

  return (
    <div className="px-4">
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
              <Popover.Panel className="absolute z-10 w-[450px] px-4 mt-[9px] right-0 sm:px-0 lg:max-w-3xl">
                <div className="relative right-[-17px] bg-tunnel-black border border-marble-white p-4 h-full">
                  {!results ? (
                    "loading"
                  ) : (
                    <>
                      <div className="">
                        <button
                          onClick={() => {
                            setContributorBoolean(false)
                          }}
                          className={`${
                            !contributorBoolean
                              ? "text-tunnel-black bg-marble-white"
                              : "text-marble-white"
                          } py-1 px-3 border border-marble-white rounded-full text-sm mr-2 hover:bg-marble-white hover:text-tunnel-black`}
                        >
                          ALL ({terminals?.length || 0})
                        </button>
                        <button
                          onClick={() => {
                            setContributorBoolean(true)
                          }}
                          className={`${
                            contributorBoolean
                              ? "text-tunnel-black bg-marble-white"
                              : "text-marble-white"
                          } py-1 px-3 border border-marble-white rounded-full text-sm mr-2 hover:bg-marble-white hover:text-tunnel-black`}
                        >
                          CONTRIBUTING ({contributorTerminals?.length || 0})
                        </button>
                      </div>
                      <div className="mt-4 grid gap-4 grid-cols-4">
                        {results.map((terminal, idx) => {
                          return (
                            <div
                              key={idx}
                              className="flex flex-col items-center cursor-pointer w-16"
                            >
                              <img
                                className="border border-marble-white h-16 w-16 rounded-full bg-concrete"
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
                        {[...Array(totalPages)].map((_, idx) => {
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
                      {hasPrev && (
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
                      {hasNext && (
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
