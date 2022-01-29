import { useState, useEffect, useMemo } from "react"
import { useAccount } from "wagmi"
import { Image, useQuery, BlitzPage, useParam, Link, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import ConnectWalletModal from "app/core/components/ConnectWalletModal"
import { TalentIdentityUnit as ContributorCard } from "app/core/components/TalentIdentityUnit/index"
import ImageLink from "../../../../core/components/ImageLink"
import getInitiativeByLocalId from "app/initiative/queries/getInitiativeByLocalId"
import Newstand from "/public/newstand-banner.png"
import StepOne from "/public/step-1.svg"
import StepTwo from "/public/step-2.svg"
import StepThree from "/public/step-3.svg"

import Back from "/public/back-icon.svg"
import Page404 from "../../../404"
import getAccountsByAddresses from "app/account/queries/getAccountsByAddresses"
import { Account } from "app/account/types"
import getTerminalById from "app/terminal/queries/getTerminalById"
import AccountModal from "app/account/components/AccountModal"
import ApplicationModal from "app/application/components/ApplicationModal"
import useStore from "app/core/hooks/useStore"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

const Project: BlitzPage = () => {
  const [{ data: accountData }] = useAccount()
  const activeUser: Account | null = useStore((state) => state.activeUser)
  let [walletModalOpen, setWalletModalOpen] = useState(false)
  let [accountModalOpen, setAccountModalOpen] = useState(false)
  let [applicationModalOpen, setApplicationModalOpen] = useState(false)
  const [userTriggered, setUserTrigged] = useState(false)
  const address = useMemo(() => accountData?.address, [accountData?.address])

  const setActiveModal = () => {
    address
      ? activeUser
        ? setApplicationModalOpen(true)
        : setAccountModalOpen(true)
      : setWalletModalOpen(true)
  }

  useEffect(() => {
    // need to check if the effect was actually triggered by the user (pressing the button)
    // if we don't then the page load account changing from null -> account while it loads
    // will trigger this to run, which we don't want.
    if (userTriggered) {
      setAccountModalOpen(false)
      setApplicationModalOpen(false)
      setWalletModalOpen(false)
      // the modal was locking the screen unless I put a timeout between modal transitions.
      // I think it has something to do with the previous modal cleaning up after it closes
      // and the "fixed" state that locks the modal to prevent the user from scrolling while
      // the modal is active does not properly clean itself up.
      setTimeout(() => setActiveModal(), 500)
    }
  }, [address, activeUser])

  const accepted = true
  const endorse = false
  const terminalId = useParam("terminalId", "number") || 1
  const initiativeLocalId = useParam("initiativeId", "number") || 0

  const [terminal] = useQuery(getTerminalById, { id: terminalId }, { suspense: false })

  const [initiative] = useQuery(
    getInitiativeByLocalId,
    { terminalTicket: terminal?.ticketAddress || "", localId: initiativeLocalId },
    { suspense: false }
  )

  let [contributors] = useQuery(
    getAccountsByAddresses,
    { addresses: initiative?.data.members || [] },
    { suspense: false }
  )

  if (!contributors) {
    contributors = []
  } else if (contributors.length > 3) {
    contributors = contributors.slice(0, 3)
  }

  if (!initiative) {
    return <Page404 />
  } else {
    return (
      <>
        <ApplicationModal
          isOpen={applicationModalOpen}
          setIsOpen={setApplicationModalOpen}
          initiativeId={initiative.id}
        />
        <AccountModal
          isOpen={accountModalOpen}
          setIsOpen={setAccountModalOpen}
          address={address || ""}
        />
        <ConnectWalletModal isWalletOpen={walletModalOpen} setIsWalletOpen={setWalletModalOpen} />
        <Layout>
          <main className="w-full h-[calc(100vh-6rem)] bg-tunnel-black flex flex-col">
            <div className="mx-4 mt-4">
              <Link href={Routes.TerminalInitiativePage({ terminalId })}>
                <Image
                  className="cursor-pointer"
                  src={Back}
                  alt="Back Icon"
                  width={25}
                  height={22}
                />
              </Link>
            </div>
            <div className="flex justify-center items-center">
              <div className="bg-tunnel-black content-center items-center h-full w-[766px] mt-5">
                <div className="flex flex-col">
                  <div className="flex flex-col text-marble-white items-center space-y-1">
                    <div className="flex flex-col items-center content-center space-y-3">
                      <span className="uppercase text-3xl">{initiative.data.shortName}</span>
                      <span className="text-sm mx-[60px] text-center">
                        {initiative.data.description}
                      </span>
                    </div>
                    <div className="cursor-pointer">
                      {initiative.data.links?.map((item, index) => (
                        <ImageLink link={item} key={index} />
                      ))}
                    </div>
                  </div>

                  <div className="h-auto mt-3">
                    <Image
                      src={initiative.data.bannerURL || Newstand}
                      alt="Project details banner image."
                      width={766}
                      height={227}
                    />
                  </div>

                  <div className=" text-marble-white flex flex-row my-4 gap-12">
                    <div className="w-3/5 flex-col items-center space-y-4">
                      <div>
                        <span className="text-lg">Calling for contributors</span>
                      </div>
                      <div className="space-y-3">
                        {initiative.data.contributeText?.map((item, index) => {
                          return (
                            <span className="text-sm flow-root" key={index}>
                              {item}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div className="w-2/5 space-y-4">
                      <div>
                        <span className="text-lg">Rewards</span>
                      </div>
                      <div className="space-y-5">
                        <span className="text-sm">{initiative.data.rewardText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-row">
                      <span className="flex-1 text-marble-white text-lg">Contributors</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {contributors.map((contributor, index) => {
                        return <ContributorCard key={index} user={contributor} />
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col text-marble-white my-8 space-y-5">
                    <div>
                      <span className="text-lg">Whats next?</span>
                    </div>
                    <div className="flex flex-row space-x-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Image src={StepOne} alt="Step one." width={24} height={24} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <span className="font-bold">Submit interest</span>
                          <div>
                            <span className="text-sm">
                              Share a little bit about yourself, your best work, and your pitch.
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <Image src={StepTwo} alt="Step two." width={24} height={24} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <span className="font-bold">Gather endorsements</span>
                          <div>
                            <span className="text-sm">
                              Trust us, endorsements from contributors help. Reach out to get to
                              know them.
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <Image src={StepThree} alt="Step three." width={24} height={24} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <span className="font-bold">Start contributing</span>
                          <div>
                            <span className="text-sm">
                              If selected, a team member will reach out to partner with you to
                              amplify your unique perspective.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center items-center">
                    <button
                      className="mt-4 py-2 text-center text-sm bg-magic-mint rounded item-center w-[280px]"
                      onClick={() => {
                        setUserTrigged(true)
                        setActiveModal()
                      }}
                    >
                      Submit interest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </Layout>
      </>
    )
  }
}

export default Project
