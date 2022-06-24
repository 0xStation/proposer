import { useState } from "react"
import { BlitzPage, Link, Routes, useParam, useQuery, useRouterQuery } from "blitz"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import Navigation from "app/terminal/components/settings/navigation"
import getCheckbooksByTerminal from "app/checkbook/queries/getCheckbooksByTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { Checkbook } from "app/checkbook/types"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import truncateString from "app/core/utils/truncateString"
import { ClipboardIcon, ClipboardCheckIcon, ExternalLinkIcon } from "@heroicons/react/outline"
import Modal from "app/core/components/Modal"
import networks from "app/utils/networks.json"
import useCheckbookFunds from "app/core/hooks/useCheckbookFunds"
import getFundingTokens from "app/core/utils/getFundingTokens"
import { formatUnits } from "ethers/lib/utils"

const CheckbookSettingsPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const { creationSuccess } = useRouterQuery()
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const [checkbooks, setCheckbooks] = useState<Checkbook[]>([])
  const [selectedCheckbook, setSelectedCheckbook] = useState<Checkbook>()
  const [isClipboardAddressCopied, setIsClipboardAddressCopied] = useState<boolean>(false)
  const [isModalAddressCopied, setIsModalAddressCopied] = useState<boolean>(false)
  const [isButtonAddressCopied, setIsButtonAddressCopied] = useState<boolean>(false)
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(!!creationSuccess)
  const [selectedFundsToken, setSelectedFundsToken] = useState<string>()

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
          // set defaulted checkbook as last so that newly created ones automatically shown on redirect
          setSelectedCheckbook((books as any[])[books.length - 1])
        }
      },
    }
  )

  const tokenOptions = getFundingTokens(selectedCheckbook, terminal)

  const selectedFunds = useCheckbookFunds(
    selectedCheckbook?.chainId as number,
    selectedCheckbook?.address as string,
    selectedCheckbook?.quorum as number,
    selectedFundsToken
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
        <Modal open={successModalOpen} toggle={setSuccessModalOpen}>
          <div className="p-2">
            <h3 className="text-2xl font-bold pt-6">Next, add funds to this Checkbook.</h3>
            <p className="mt-2">
              To activate your Checkbook, please transfer funds to the contract address.
            </p>
            <div className="mt-8">
              <button
                className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75"
                onClick={() => {
                  navigator.clipboard.writeText(selectedCheckbook?.address as string).then(() => {
                    setIsModalAddressCopied(true)
                    setTimeout(() => setSuccessModalOpen(false), 450) // slight delay before closing modal
                  })
                }}
              >
                {isModalAddressCopied ? "Copied!" : "Copy Address"}
              </button>
            </div>
          </div>
        </Modal>
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
                className="rounded text-tunnel-black px-8 h-[32px] bg-electric-violet self-start"
                type="submit"
              >
                Create
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-7 h-[calc(100vh-115px)] w-full box-border">
            <div className="overflow-y-auto col-span-4">
              {checkbooks.map((checkbook) => {
                return <CheckbookComponent checkbook={checkbook} key={checkbook.address} />
              })}
            </div>
            {checkbooks.length > 0 && (
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
                        <a
                          href={`${
                            networks[selectedCheckbook?.chainId as number].explorer
                          }/address/${selectedCheckbook?.address as string}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLinkIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                        </a>
                        <div>
                          <button
                            onClick={() => {
                              navigator.clipboard
                                .writeText(selectedCheckbook?.address as string)
                                .then(() => {
                                  setIsClipboardAddressCopied(true)
                                  setTimeout(() => setIsClipboardAddressCopied(false), 3000)
                                })
                            }}
                          >
                            {isClipboardAddressCopied ? (
                              <>
                                <ClipboardCheckIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                              </>
                            ) : (
                              <ClipboardIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                            )}
                          </button>
                          {isClipboardAddressCopied && (
                            <span className="text-[.5rem] uppercase font-bold tracking-wider rounded px-1 absolute text-marble-white bg-wet-concrete">
                              copied!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6 mt-12">
                    <div>
                      <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                        Chain
                      </h3>
                      <p className="mt-2">{networks[selectedCheckbook?.chainId!].name}</p>
                    </div>
                    <div>
                      <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                        Signers
                      </h3>
                      {
                        // dynamically populate addresses later
                        (selectedCheckbook?.signerAccounts || []).map((account, i) => (
                          <div key={i} className="flex flex-row mt-4">
                            <div className="flex flex-col content-center align-middle mr-3">
                              {account.data.pfpURL ? (
                                <img
                                  src={account.data.pfpURL}
                                  alt="PFP"
                                  className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
                                  onError={(e) => {
                                    e.currentTarget.src = DEFAULT_PFP_URLS.USER
                                  }}
                                />
                              ) : (
                                <div className="h-[46px] min-w-[46px] place-self-center border border-wet-concrete bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
                              )}
                            </div>
                            <div className="flex flex-col content-center">
                              <div className="flex flex-row items-center space-x-1">
                                <p className="text-base text-marble-white font-bold">
                                  {account.data.name}
                                </p>
                              </div>
                              <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                                <p className="w-max truncate leading-4">
                                  @{truncateString(account.address)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    <div>
                      <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                        Approval Quorum
                      </h3>
                      <p className="mt-2">{selectedCheckbook?.quorum || 1}</p>
                    </div>
                    <div>
                      <h3 className="uppercase text-xs text-concrete font-bold tracking-wider">
                        Funds
                      </h3>
                      {/* <p className="mt-2">
                        There are no funds available to deploy. Copy the contract address and
                        transfer funds to this Checkbook from Gnosis or other wallet applications.
                      </p>
                      <button
                        type="button"
                        className="text-electric-violet border border-electric-violet w-40 mt-3 py-1 px-4 rounded hover:opacity-75"
                        onClick={() =>
                          navigator.clipboard
                            .writeText(selectedCheckbook?.address as string)
                            .then(() => {
                              setIsButtonAddressCopied(true)
                              setTimeout(() => setIsButtonAddressCopied(false), 3000)
                            })
                        }
                      >
                        {isButtonAddressCopied ? "Copied!" : "Copy Address"}
                      </button> */}
                      <select
                        className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-3`}
                        onChange={({ target: { options, selectedIndex } }) => {
                          setSelectedFundsToken(options[selectedIndex]?.value)
                        }}
                      >
                        {tokenOptions.map((token, i) => {
                          return (
                            <option key={i} value={token.address}>
                              {token.symbol}
                            </option>
                          )
                        })}
                      </select>
                      <p className="mt-4">{`Total: ${formatUnits(
                        selectedFunds?.total,
                        selectedFunds?.decimals
                      )}`}</p>
                      <p className="mt-2">{`Available: ${formatUnits(
                        selectedFunds?.available,
                        selectedFunds?.decimals
                      )}`}</p>
                      <p className="mt-2">{`Pending: ${formatUnits(
                        selectedFunds?.pending,
                        selectedFunds?.decimals
                      )}`}</p>
                      <p className="mt-2">{`Cashed: ${formatUnits(
                        selectedFunds?.cashed,
                        selectedFunds?.decimals
                      )}`}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

export default CheckbookSettingsPage
