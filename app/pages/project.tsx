import { useMemo } from "react"
import { useEthers, useSendTransaction } from "@usedapp/core"
import { users } from "../core/utils/data"
import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import Contributors from "../core/components/Contributors"

const Project: BlitzPage = () => {
  interface Instructions {
    title: string
    details: string
  }

  const { activateBrowserWallet, account } = useEthers()
  const connectedUser = useMemo(() => (account ? users[account] : null), [account])
  const onError = (error: Error) => {
    console.log(error.message)
  }

  const title: string = "Newstand"
  const description: string =
    "Station Network’s publication focused on exploring the possibilities of work in an era of hyper connectivity and fluidity."
  const instructions: Instructions = {
    title: "Calling for contributors",
    details:
      "Reach out with your pitch. A Newstand Editor will partner with you to brainstorm and develop a pitch that looks to amplifies and refines your unique perspective or point of view. After a first draft, your Editor will provide edits and help you bring your piece to second draft. Other contributors to Station may act as supplementary editors to whatever extent is helpful to the contributor. \n Reach out with your pitch. A Newstand Editor will partner with you to brainstorm and develop a pitch that looks to amplifies and refines your unique perspective or point of view. After a first draft, your Editor will provide edits and help you bring your piece to second draft. Other contributors to Station may act as supplementary editors to whatever extent is helpful to the contributor. \nReach out with your pitch. A Newstand Editor will partner with you to brainstorm and develop a pitch that looks to amplifies and refines your unique perspective or point of view. After a first draft, your Editor will provide edits and help you bring your piece to second draft. Other contributors to Station may act as supplementary editors to whatever extent is helpful to the contributor.",
  }

  return (
    <Layout>
      <main className="w-full h-[calc(100vh-6rem)] bg-tunnel-black">
        <div>icon</div>
        <div className="bg-tunnel-black content-center items-center h-full mx-80 mt-5">
          <div className="flex flex-col">
            <div className="flex flex-col text-marble-white items-center space-y-3">
              <span className="uppercase text-2xl ">{title}</span>
              <span className="text-xs mx-35">{description}</span>
              <div className="text-marble-white">
                <span>Links</span>
              </div>
            </div>

            <div></div>

            <div className=" text-marble-white flex flex-row items-center my-4">
              <div className="flex-2 flex-col items-center mr-4 space-y-10">
                <span className="text-2xl">{instructions.title}</span>
                <br />
                <span>{instructions.details}</span>
              </div>

              <div className=" ml-4 flex-1">
                <span className="text-2xl">Rewards</span>
              </div>
            </div>

            <div className="">
              <span className="text-marble-white text-2xl">Contributors</span>
              <div className="flex flex-row space-x-4">
                <Contributors></Contributors>
                <Contributors></Contributors>
                <Contributors></Contributors>
              </div>
            </div>

            <div className="text-marble-white">
              <span className="text-2xl">Next steps</span>
              <div className="flex flex-row space-x-4">
                <div className="flex-1">Submit interest</div>
                <div className="flex-1">Gather endorsements</div>
                <div className="flex-1">Start contributing</div>
              </div>
            </div>

            <div className="">
              <button
                className="mt-4 w-full py-2 text-center text-sm bg-magic-mint rounded item-center"
                onClick={() => activateBrowserWallet(onError)}
              >
                Submit interest
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default Project
