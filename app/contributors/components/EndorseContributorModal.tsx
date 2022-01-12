import { useQuery, useParam, invoke, Image } from "blitz"
import { useState } from "react"
import { useEthers } from "@usedapp/core"
import { Field, Form } from "react-final-form"
import Verified from "public/check-mark.svg"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import Modal from "../../core/components/Modal"
import {
  NUMBER_OF_DECIMALS,
  useEndorsementGraphMethod,
  useEndorsementTokenBalance,
  useEndorsementTokenMethod,
  useAllowance,
} from "app/core/contracts/contracts"
import { TERMINAL } from "app/core/utils/constants"
import getAccountByAddress from "app/account/queries/getAccountByAddress"

const MAX_ALLOWANCE = 100000000000000

const EndorseContributorModal = ({ isOpen, setIsOpen, selectedUserToEndorse: contributor }) => {
  const { account, active } = useEthers()
  const contributorData = contributor?.data || {}

  const terminalId = useParam("terminalId", "number") || 1
  const [initiatives] = useQuery(getInitiativesByTerminal, { terminalId }, { suspense: false })

  const { send: endorse } = useEndorsementGraphMethod("endorse")
  const { send: approveAllowance } = useEndorsementTokenMethod("approve")
  const tokenBalance = useEndorsementTokenBalance(account)
  const allowance = useAllowance(account)

  const [error, setError] = useState("")

  const handleApproveAllowance = async (e) => {
    e.preventDefault()
    setError("")
    if (!account) {
      console.warn("account is not properly connected")
      return
    }
    await approveAllowance(TERMINAL.GRAPH_ADDRESS, MAX_ALLOWANCE)
  }

  return (
    <Modal title="Endorse" open={isOpen} toggle={setIsOpen}>
      <div className="mt-8">
        <Form
          onSubmit={async (values) => {
            const { endorsementAmount, initiative } = values
            setError("")
            if (!Object.keys(values).length || !initiative) {
              setError("Please fill out required inputs")
              return
            }
            if (!account || !active || !tokenBalance) {
              setError("Please disconnect, refresh the page, and re-connect your account")
              return
            }
            const currentAccount = await invoke(getAccountByAddress, { address: account })

            if (!currentAccount) {
              setError("Sorry something went wrong, please try again later")
              return
            }

            if (endorsementAmount > tokenBalance) {
              setError("You don't have enough points to endorse!")
              return
            }

            if (endorsementAmount <= 0) {
              setError("Please enter a valid amount")
              return
            }

            await endorse(
              initiative,
              currentAccount.data?.ticketId,
              contributorData.ticketId,
              endorsementAmount * Math.pow(10, NUMBER_OF_DECIMALS)
            )
          }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-center text-torch-red text-sm">{error}</div>
              <div className="flex flex-row flex-1">
                <div className="flex-1 items-center justify-center text-marble-white text-sm">
                  Contributor
                </div>
                <div className="flex flex-1 align-right place-content-end content-right text-marble-white text-sm">
                  {contributorData.pfpURL ? (
                    <img
                      src={contributor.data.pfpURL}
                      alt="PFP"
                      className="h-[20px] w-[20px] border border-marble-white rounded-full mr-1"
                    />
                  ) : (
                    <div className="h-[20px] w-[20px] place-self-center border border-marble-white rounded-full place-items-center mr-1"></div>
                  )}
                  <div className="mr-1">{contributorData.handle || "N/A"}</div>
                  <Image src={Verified} alt="Verified icon." width={10} height={10} />
                </div>
              </div>
              <div className="flex flex-row flex-1">
                <div className="flex-1 items-center justify-center text-marble-white text-sm">
                  Your Endorsement Budget
                </div>
                <div className="flex flex-1 align-right place-content-end content-right text-marble-white text-sm">
                  {tokenBalance !== undefined ? (
                    tokenBalance
                  ) : (
                    <span className="text-torch-red">
                      Please disconnect and reconnect your wallet
                    </span>
                  )}
                </div>
              </div>
              <hr className="border-[.5] border-solid border-marble-white w-3/2 mx-[-1.5rem] my-5"></hr>
              <div className="flex flex-col my-5">
                <label htmlFor="url" className="text-marble-white">
                  Initiative
                </label>
                <Field
                  component="select"
                  name="initiative"
                  placeholder="something.com"
                  className="mt-1 border border-concrete bg-concrete text-marble-white p-2"
                >
                  <option>Please select an initiative</option>
                  {initiatives?.map((initiative) => (
                    <option key={initiative.localId} value={initiative.localId}>
                      {initiative?.data?.name}
                    </option>
                  ))}
                  <option key={0} value={0}>
                    Other
                  </option>
                </Field>
              </div>
              <div className="flex flex-col">
                <label htmlFor="url" className="text-marble-white">
                  Endorsement Amount
                </label>
                <Field
                  component="input"
                  type="number"
                  name="endorsementAmount"
                  placeholder="Please enter an amount"
                  className="mt-1 border border-concrete bg-concrete text-marble-white p-2"
                />
              </div>
              {allowance > 100 ? (
                <button
                  type="submit"
                  className="bg-magic-mint text-tunnel-black w-1/2 rounded mt-12 mx-auto block p-1"
                >
                  Endorse
                </button>
              ) : (
                <button
                  className="bg-magic-mint text-tunnel-black w-3/5 rounded mt-12 mx-auto block p-1"
                  onClick={handleApproveAllowance}
                >
                  Allow Station to move tokens on your behalf
                </button>
              )}
            </form>
          )}
        />
      </div>
    </Modal>
  )
}

export default EndorseContributorModal
