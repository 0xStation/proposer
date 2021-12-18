import { useMemo, useState, useEffect } from "react"
import { useEthers, useSendTransaction } from "@usedapp/core"
import { users } from "../core/utils/data"
import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import { useEndorseContractMethod, useIncreaseAllowanceMethod } from "../core/contracts/contracts"
import { useSuppressFirstRenderFlicker } from "../core/hooks/useSuppressFirstRenderFlicker"

const Home: BlitzPage = () => {
  const { activateBrowserWallet, account, active } = useEthers()
  const connectedUser = useMemo(() => (account ? users[account] : null), [account])
  const [walletToEndorse, setWalletToEndorse] = useState<string>("")
  const [endorsementAmount, setEndorsementAmount] = useState<number>(0)
  const [endorsementCallState, setEndorsementCallState] = useState<any>(null)
  const [allowanceIncreased, setAllowanceIncreased] = useState<any>(false)
  const suppressRender = useSuppressFirstRenderFlicker()
  const { state: endorseState, send: endorse } = useEndorseContractMethod("endorse")
  const { state: allowanceState, send: increaseAllowance } =
    useIncreaseAllowanceMethod("increaseAllowance")
  const { sendTransaction, state: transactionState } = useSendTransaction({
    transactionName: "Send Ethereum",
  })

  useEffect(() => {
    console.log("endorse state post transaction call ", endorseState)
  }, [endorseState])

  useEffect(() => {
    console.log("allowance state post transaction call ", allowanceState)
  }, [allowanceState])

  if (suppressRender || !active) return null

  const usersToEndorse = Object.keys(users).filter(
    (userWalletAddress) => account !== userWalletAddress
  )

  const handleIncreaseAllowance = async (e) => {
    if (!endorsementAmount) {
      alert("Please choose an endorsement amount first")
      return
    }

    await increaseAllowance("0xa3395B5FEfca8bb39032A9604C0337fF7e847323", endorsementAmount * 1000)
    setAllowanceIncreased(!allowanceIncreased)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!walletToEndorse) {
      alert("Please choose a user to endorse first")
      return
    }
    if (!endorsementAmount) {
      alert("Please choose an endorsement amount first")
      return
    }

    const nftIdTo = users[walletToEndorse].nftId
    const nftIdFrom = users[account].nftId
    await endorse(0, nftIdFrom, nftIdTo, endorsementAmount * 1000)
  }

  const ConnectView = connectedUser ? (
    <div className="max-w-screen-xl mx-auto mt-20 text-center">
      <p className="text-2xl pr-6">{`You're connected 🎉: ${account}`}</p>
      <p className="text-2xl pr-6">{`Welcome ${connectedUser?.handle} !`}</p>
      <form onSubmit={handleSubmit}>
        <label className="text-2xl pr-6">Who would you like to endorse?</label>
        <select
          className="inline border-2 border-gray-200 rounded mr-1"
          onChange={(e) => setWalletToEndorse(e.target.value)}
        >
          <option key="" value="">
            --Please choose a user to endorse--
          </option>
          {usersToEndorse.map((walletAddress) => (
            <option key={users[walletAddress].handle} value={walletAddress}>
              {users[walletAddress].handle}
            </option>
          ))}
        </select>
        <label className="text-2xl pr-6">How much would you like to endorse?</label>
        <input
          type="number"
          id="endorsement"
          name="endorsement"
          min="0"
          max="100"
          step=".001"
          className="border-2"
          onChange={(e) => {
            setEndorsementAmount(parseFloat(e.target.value))
            setAllowanceIncreased(false)
          }}
          required
        />
        <button type="button" className="border-solid border-2" onClick={handleIncreaseAllowance}>
          Allow
        </button>
        <button type="submit" className="border-solid border-2">
          Submit
        </button>
      </form>
    </div>
  ) : (
    <button
      style={{ top: "40%", left: "40%" }}
      className="px-48 py-12 text-center bg-magic-mint no-underline border-2 absolute"
      onClick={() => activateBrowserWallet()}
    >
      Connect Wallet
    </button>
  )

  return <main className="w-screen h-screen">{ConnectView}</main>
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
