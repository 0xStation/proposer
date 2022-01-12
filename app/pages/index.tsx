import { Router } from "blitz"
import { useMemo, useState, useEffect } from "react"
import { useEthers } from "@usedapp/core"
import { users } from "../core/utils/data"
import { BlitzPage, useMutation } from "blitz"
import generateTicketVisual from "app/ticket/mutations/generateTicketVisual"
import Layout from "app/core/layouts/Layout"

const Home: BlitzPage = () => {
  const { activateBrowserWallet, account } = useEthers()
  const connectedUser = useMemo(() => (account ? users[account] : null), [account])

  const onError = (error: Error) => {
    console.log(error.message)
  }

  const [generateTicketVisualMutation] = useMutation(generateTicketVisual)

  useEffect(() => {
    if (connectedUser) {
      const terminalId = window && window.location?.host?.includes("localhost") ? "1" : "3"
      Router.push(`/terminal/${terminalId}/contributors`)
    }
  }, [connectedUser])

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
            className="inline text-tunnel-black border-2 border-gray-200 rounded mr-1"
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
            className="border-2 text-tunnel-black"
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

        <button
          className="mt-4 border p-2"
          onClick={() => {
            generateTicketVisualMutation({
              accountAddress: account || "",
              accountName: "michael",
              terminalName: "station",
              roleName: "CORE",
            })
          }}
        >
          create NFT
        </button>
        <img src="https://station.nyc3.digitaloceanspaces.com/tickets/33dc95dd-c097-4658-86b3-10bc8aac23d3.svg" />
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
    <Layout title="Home">
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
