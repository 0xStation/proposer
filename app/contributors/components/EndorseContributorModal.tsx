import { useQuery, useParam, invoke } from "blitz"
import { useEthers } from "@usedapp/core"
import { Field, Form } from "react-final-form"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import Modal from "../../core/components/Modal"
import {
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
  const tokenBalance = useEndorsementTokenBalance(account)
  const allowance = useAllowance(account)
  const { send: approveAllowance } = useEndorsementTokenMethod("approve")

  const handleApproveAllowance = async (e) => {
    e.preventDefault()
    const approvedAllowance = approveAllowance(TERMINAL.GRAPH_ADDRESS, MAX_ALLOWANCE)

    if (!approvedAllowance) {
      alert("Sorry, something went wrong")
    }
  }

  return (
    <Modal title="Endorse" open={isOpen} toggle={setIsOpen}>
      <div className="mt-8">
        <Form
          onSubmit={async (values) => {
            const { endorsementAmount, initiative } = values
            if (!Object.keys(values).length || !initiative) {
              alert("Please fill out required inputs")
              return
            }
            if (!account || !active || !tokenBalance) {
              alert("Please disconnect, refresh the page, and re-connect your account")
              return
            }
            const currentAccount = await invoke(getAccountByAddress, { address: account })

            if (!currentAccount) {
              alert("Sorry something went wrong, please try again later")
              return
            }

            if (parseInt(endorsementAmount) > parseInt(tokenBalance)) {
              alert("You don't have enough points to endorse!")
              return
            }

            await endorse(
              initiative,
              currentAccount.data?.ticketId,
              contributorData.ticketId,
              endorsementAmount * 1000
            )
          }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-row flex-1">
                <div className="flex-1 items-center justify-center text-marble-white text-sm">
                  Contributor
                </div>
                <div className="flex flex-1 align-right place-content-end content-right text-marble-white text-sm">
                  {contributorData.handle || "N/A"}
                </div>
              </div>
              <div className="flex flex-row flex-1">
                <div className="flex-1 items-center justify-center text-marble-white text-sm">
                  Endorsement Budget
                </div>
                <div className="flex flex-1 align-right place-content-end content-right text-marble-white text-sm">
                  {tokenBalance ? (
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
                </Field>
              </div>
              <div className="flex flex-col">
                <label htmlFor="url" className="text-marble-white">
                  Endorsement Amount
                </label>
                <Field
                  component="input"
                  type="number"
                  max="1000"
                  name="endorsementAmount"
                  placeholder="Please enter an amount"
                  className="mt-1 border border-concrete bg-concrete text-marble-white p-2"
                />
              </div>
              {parseInt(allowance) > 100 ? (
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
