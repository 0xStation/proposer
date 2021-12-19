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

  const onError = (error: Error) => {
    console.log(error.message)
  }

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
    <div className="flex items-center justify-center h-full">
      <div className="max-w-screen-lg p-4 border border-marble-white text-center bg-tunnel-black text-marble-white">
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
    </div>
  ) : (
    <div className="flex items-center h-full ml-40">
      <div className="bg-tunnel-black border border-marble-white p-4 w-128">
        <h3 className="text-marble-white text-3xl">Welcome to Station</h3>
        <p className="text-marble-white text-sm mt-4">
          This is where contributors come together and discover and participate in some of the most
          exciting communities in Web3.
        </p>
        <p className="text-marble-white text-sm mt-4">Join the ride.</p>
        <button
          className="mt-4 w-full py-2 text-center text-sm bg-magic-mint rounded"
          onClick={() => activateBrowserWallet(onError)}
        >
          Enter Station
        </button>
      </div>
    </div>
  )

  return (
    <Layout title="Home" user={connectedUser}>
      <main
        className="w-full h-[calc(100vh-6rem)] bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/station-cover.png')" }}
      >
        {ConnectView}
      </main>
    </Layout>
  )
}

Home.suppressFirstRenderFlicker = true
// I wasn't able to figure out how to pass props (like connected user) when using this .getLayout method.
// I think it helps to reduce redudant component loads, which is nice, and maybe worth figuring out in the future.
// https://adamwathan.me/2019/10/17/persistent-layout-patterns-in-nextjs/

// Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
