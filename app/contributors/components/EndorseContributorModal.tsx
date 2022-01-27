import { useQuery, useParam, invoke, Image } from "blitz"
import { useState, useEffect, useMemo } from "react"
import { useAccount, useBalance } from "wagmi"
import { BigNumberish, utils } from "ethers"
import { Field, Form } from "react-final-form"
import Verified from "public/check-mark.svg"
import getInitiativesByTerminal from "app/initiative/queries/getInitiativesByTerminal"
import Modal from "../../core/components/Modal"
import {
  useEndorsementGraphWrite,
  useEndorsementTokenRead,
  useEndorsementTokenWrite,
  useDecimals,
} from "app/core/contracts/contracts"
import { TERMINAL, DEFAULT_NUMBER_OF_DECIMALS } from "app/core/utils/constants"
import useStore from "app/core/hooks/useStore"
import { Account } from "app/account/types"

const MAX_ALLOWANCE = 100000000000000

const EndorseContributorModal = ({ isOpen, setIsOpen, selectedUserToEndorse: contributor }) => {
  const [{ data: accountData }] = useAccount({
    fetchEns: true,
  })

  const activeUser: Account | null = useStore((state) => state.activeUser)

  const [allowance, setAllowance] = useState<number>()
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])

  const contributorData = contributor?.data || {}

  const terminalHandle = useParam("terminalHandle") as string
  const [initiatives] = useQuery(getInitiativesByTerminal, { terminalHandle }, { suspense: false })

  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const [{ data: balanceData }] = useBalance({
    addressOrName: address,
    token: TERMINAL.TOKEN_ADDRESS,
    watch: true,
    formatUnits: decimals,
  })
  const tokenBalance = parseFloat(balanceData?.formatted || "")

  const { read: getAllowance } = useEndorsementTokenRead({
    methodName: "allowance",
  })

  const { write: approveAllowance } = useEndorsementTokenWrite({ methodName: "approve" })

  const { loading, write: endorse } = useEndorsementGraphWrite({ methodName: "endorse" })

  useEffect(() => {
    const getEndorsementTokenAllowance = async () => {
      const { data: tokenAllowance, error } = await getAllowance({
        args: [address, TERMINAL.GRAPH_ADDRESS],
      })
      setAllowance(parseFloat(utils.formatUnits((tokenAllowance as BigNumberish) || 0, decimals)))
    }
    getEndorsementTokenAllowance()
  }, [decimals, address])

  const [error, setError] = useState("")

  const handleApproveAllowance = async (e) => {
    e.preventDefault()
    setError("")
    if (!address) {
      alert("account is not properly connected")
      return
    }
    await approveAllowance({ args: [TERMINAL.GRAPH_ADDRESS, MAX_ALLOWANCE] })
  }

  const Spinner = () => (
    <div className="animate-spin border w-5 h-5 border-solid rounded-full inline-block border-t-5 border-t-neon-carrot"></div>
  )

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
            if (!address) {
              setError("Please disconnect, refresh the page, and re-connect your account")
              return
            }

            if (!activeUser) {
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

            await endorse({
              args: [
                initiative,
                activeUser?.data.ticketId,
                contributorData.ticketId,
                endorsementAmount * Math.pow(10, decimals),
              ],
            })
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
                  {tokenBalance === undefined || isNaN(tokenBalance) ? (
                    <span className="text-torch-red">
                      Please disconnect and reconnect your wallet
                    </span>
                  ) : (
                    tokenBalance
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
              {allowance && allowance > 100 ? (
                <button
                  type="submit"
                  className="bg-magic-mint text-tunnel-black w-1/2 rounded mt-12 mx-auto block p-1"
                >
                  {loading ? <Spinner /> : "Endorse"}
                </button>
              ) : (
                <button
                  className="bg-magic-mint text-tunnel-black w-3/5 rounded mt-12 mx-auto block p-1"
                  onClick={handleApproveAllowance}
                >
                  {address
                    ? "Allow Station to move tokens on your behalf"
                    : "Please connect your wallet"}
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
