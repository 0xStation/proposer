import { useState } from "react"
import { BlitzPage, Link, Routes, useParam, useQuery } from "blitz"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import Navigation from "app/terminal/components/settings/navigation"
import getCheckbooksByTerminal from "app/checkbook/queries/getCheckbooksByTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { Checkbook } from "app/checkbook/types"

const CheckbookSettingsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const [checkbooks, setCheckbooks] = useState<Checkbook[]>([])
  const [selectedCheckbook, setSelectedCheckbook] = useState<Checkbook>()

  useQuery(
    getCheckbooksByTerminal,
    { terminalId: terminal?.id as number },
    {
      suspense: false,
      enabled: !!terminal?.id,
      onSuccess: (books) => {
        if (!books || books.length === 0) {
          return
        }
        setCheckbooks(books as any[])
        if (!selectedCheckbook) {
          setSelectedCheckbook((books as any[])[0])
        }
      },
    }
  )

  const CheckbookComponent = ({ checkbook }) => {
    return (
      <div
        tabIndex={0}
        className={`flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer ${
          checkbook.address === selectedCheckbook?.address ? "bg-wet-concrete" : ""
        }`}
        onClick={() => setSelectedCheckbook(checkbook)}
      >
        <div className="flex space-x-2">
          <div className="flex flex-col content-center">
            <div className="flex flex-row items-center space-x-1">
              <p className="text-lg text-marble-white font-bold">{checkbook.name}</p>
            </div>
            <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
              <p className="w-max">{checkbook.address}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        {checkbooks.length === 0 ? (
          <div className="w-full h-full flex items-center flex-col justify-center">
            <p className="text-marble-white text-2xl font-bold">Create Checkbook</p>
            <p className="mt-2 text-marble-white text-base w-[400px] text-center">Do it.</p>
            <Link href={Routes.NewCheckbookSettingsPage({ terminalHandle })}>
              <button className="cursor-pointer mt-8 w-[200px] py-1 bg-magic-mint text-tunnel-black rounded text-base">
                Create
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-6 border-b border-concrete flex justify-between">
              <div className="flex flex-col">
                <h2 className="text-marble-white text-2xl font-bold">Checkbook™</h2>
                <h5 className="text-base mt-2">
                  A Checkbook is a contract that allows you to create checks for fund recipients to
                  cash out.
                </h5>
              </div>
              <Link href={Routes.NewCheckbookSettingsPage({ terminalHandle })}>
                <button
                  className="rounded text-tunnel-black px-8 h-full h-[32px] bg-magic-mint self-start"
                  type="submit"
                >
                  Create Checkbook
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-7 h-[calc(100vh-115px)] w-full box-border">
              <div className="overflow-y-auto col-span-4">
                {checkbooks.map((checkbook) => {
                  return <CheckbookComponent checkbook={checkbook} key={checkbook.address} />
                })}
              </div>
              <div className="h-full border-l border-concrete col-span-3">
                <div className="m-5 flex-col">
                  <div className="flex space-x-2">
                    <div className="flex flex-col content-center">
                      <div className="flex flex-row items-center space-x-1">
                        <div className="text-lg text-marble-white font-bold">
                          {selectedCheckbook?.name}
                        </div>
                      </div>
                      <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                        <div className="w-max truncate leading-4">{selectedCheckbook?.address}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6 mt-12">
                    <div>
                      <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                        Signers
                      </h3>
                      <p className="mt-2">Coming soon!</p>
                    </div>
                    <div>
                      <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                        Amount
                      </h3>
                      <p className="mt-2">
                        There’s no funds available to deploy. Copy the contract address and transfer
                        funds to this Checkbook from Gnosis or other wallet applications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

export default CheckbookSettingsPage
