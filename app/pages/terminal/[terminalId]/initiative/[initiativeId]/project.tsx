import { useMemo } from "react"
import { useEthers, useSendTransaction } from "@usedapp/core"
import { users } from "../../../../../core/utils/data"
import { Image, useQuery, BlitzPage, useParam } from "blitz"
import Layout from "app/core/layouts/Layout"
import Contributors from "../../../../../core/components/Contributors"
import getInitiativeById from "app/terminal/initiative/queries/getInitiativeById"
// import banner from ".../public/newstand-banner.png"

const Project: BlitzPage = () => {
  interface Instructions {
    title: string
    details: string
  }

  const initiativeId = useParam("initiativeId", "number") || 1

  const initiative = useQuery(getInitiativeById, { id: initiativeId }, { suspense: false })

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
      "Reach out with your pitch. A Newstand Editor will partner with you to brainstorm and develop a pitch that looks to amplifies and refines your unique perspective or point of view. After a first draft, your Editor will provide edits and help you bring your piece to second draft.",
  }

  return (
    <Layout>
      <main className="w-full h-[calc(100vh-6rem)] bg-tunnel-black flex flex-col">
        <div className="mx-4 mt-2">
          <span className="text-marble-white text-sm">Back Icon</span>
        </div>
        <div className="flex justify-center items-center">
          <div className="bg-tunnel-black content-center items-center h-full w-[766px] mt-5">
            <div className="flex flex-col">
              <div className="flex flex-col text-marble-white items-center space-y-1">
                <div className="flex flex-col items-center space-y-3">
                  <span className="uppercase text-3xl ">{title}</span>
                  <span className="text-sm mx-35">{description}</span>
                </div>
                <div className="text-marble-white text-sm">
                  <span>Links</span>
                </div>
              </div>

              <div className="h-[227px] border border-marble-white bg-marble-white my-4">
                {/* <Image
                className="h-227 border border-marble-white"
                src={banner}
                alt="Project details banner image."
              /> */}
                <img src=".../public/newstand-banner.png" alt="Project banner image." />
              </div>

              <div className=" text-marble-white flex flex-row my-4 gap-12">
                <div className="w-3/5 flex-col items-center space-y-4">
                  <div>
                    <span className="text-lg">Calling for contributors</span>
                  </div>
                  <div className="space-y-3 ">
                    <span className="text-sm flow-root">{instructions.details}</span>
                    <span className="text-sm flow-root">{instructions.details}</span>
                    <span className="text-sm flow-root">{instructions.details}</span>
                  </div>
                </div>

                <div className="w-2/5 space-y-4">
                  <div>
                    <span className="text-lg">Rewards</span>
                  </div>
                  <div className="space-y-5">
                    <span className="text-sm">800 USD</span>
                    <br />
                    <span className="text-sm">Station Visitor Ticket NFT</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-marble-white text-lg">Contributors</span>
                <div className="flex flex-row space-x-4">
                  <Contributors></Contributors>
                  <Contributors></Contributors>
                  <Contributors></Contributors>
                </div>
              </div>

              <div className="flex flex-col text-marble-white my-8 space-y-5">
                <div>
                  <span className="text-lg">Whats next?</span>
                </div>
                <div className="flex flex-row space-x-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <hr />
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="font-bold">Submit interest</span>
                      <div>
                        <span>
                          Share a little bit about yourself, your best work, and your Newstand
                          pitch.
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <hr />
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="font-bold">Gather endorsements</span>
                      <div>
                        <span>
                          Trust us, endorsements from contributors help. Reach out to get to know
                          them.
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <hr />
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="font-bold">Start contributing</span>
                      <div>
                        <span>
                          If selected, a Newstand editor will reach out to partner with you to
                          amplify your unique perspective.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center ">
                <button
                  className="mt-4 w-full py-2 text-center text-sm bg-magic-mint rounded item-center w-[280px]"
                  onClick={() => activateBrowserWallet(onError)}
                >
                  Submit interest
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default Project
