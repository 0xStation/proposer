import { useState, useEffect, useMemo } from "react"
import { useAccount } from "wagmi"
import { Image, useQuery, BlitzPage, useParam, Link, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import { TalentIdentityUnit as ContributorCard } from "app/core/components/TalentIdentityUnit/index"
import ImageLink from "../../../../core/components/ImageLink"
import getInitiativeByLocalId from "app/initiative/queries/getInitiativeByLocalId"
import StepOne from "/public/step-1.svg"
import StepTwo from "/public/step-2.svg"
import StepThree from "/public/step-3.svg"
import ContributorDirectoryModal from "app/contributors/components/ContributorDirectoryModal"
import Back from "/public/back-icon.svg"
import { Account } from "app/account/types"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import ApplicationModal from "app/application/components/ApplicationModal"
import useStore from "app/core/hooks/useStore"
import usePagination from "app/core/hooks/usePagination"
import Tag from "app/core/components/Tag"

const Project: BlitzPage = () => {
  const [hasApplied, setHasApplied] = useState(false)
  const [{ data: accountData }] = useAccount()
  const activeUser: Account | null = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const toggleAccountModal = useStore((state) => state.toggleAccountModal)
  let [applicationModalOpen, setApplicationModalOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [userTriggered, setUserTrigged] = useState(false)
  const address = useMemo(() => accountData?.address, [accountData?.address])
  const [contributorDirectoryModalIsOpen, setContributorDirectoryModalOpen] = useState(false)
  const [selectedContributorToView, setSelectedContributorToView] = useState<Account | null>(null)

  const setActiveModal = () => {
    address
      ? activeUser
        ? setApplicationModalOpen(true)
        : toggleAccountModal(true)
      : toggleWalletModal(true)
  }

  useEffect(() => {
    setApplicationModalOpen(false)
    toggleWalletModal(false)
    let handler
    if (userTriggered) {
      handler = setTimeout(() => setActiveModal(), 550)
    }
    return () => {
      clearTimeout(handler)
    }
  }, [address, activeUser])

  const terminalHandle = useParam("terminalHandle") as string
  const initiativeLocalId = useParam("initiativeId", "number") as number

  useEffect(() => {
    if (activeUser && initiativeLocalId) {
      let currentInit = activeUser.initiatives?.find(
        (init) => init.initiativeId === initiativeLocalId
      )
      if (currentInit) {
        setHasApplied(true)
      }
    }
  }, [activeUser, initiativeLocalId])

  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const [initiative] = useQuery(
    getInitiativeByLocalId,
    {
      terminalId: terminal?.id || 0,
      localId: initiativeLocalId,
    },
    { suspense: false }
  )

  const contributorCards = initiative?.contributors?.map((contributor, idx) => {
    const { points, joinedAt } = contributor
    let onClick

    onClick = () => {
      setSelectedContributorToView(contributor)
      setContributorDirectoryModalOpen(true)
    }

    const contributorCardProps = {
      user: contributor,
      points,
      onClick,
      dateMetadata: joinedAt && {
        joinedAt,
      },
      referrals: [],
      isEndorsable: false,
    }
    return <ContributorCard key={idx} {...contributorCardProps} />
  })

  const { results, totalPages, hasNext, hasPrev } = usePagination(contributorCards, page, 3)

  return (
    <>
      {initiative && (
        <ApplicationModal
          isOpen={applicationModalOpen}
          setIsOpen={setApplicationModalOpen}
          initiativeId={initiative.id}
        />
      )}
      {selectedContributorToView && (
        <ContributorDirectoryModal
          contributor={selectedContributorToView}
          isOpen={contributorDirectoryModalIsOpen}
          setIsOpen={setContributorDirectoryModalOpen}
          terminalId={terminal?.id || 0}
        />
      )}
      <main className="w-full h-[calc(100vh-6rem)] bg-tunnel-black flex flex-col p-3">
        <div className="flex sm:mx-1 md:mx-4 my-4">
          <Link href={Routes.TerminalInitiativePage({ terminalHandle })}>
            <Image className="cursor-pointer" src={Back} alt="Back Icon" width={25} height={22} />
          </Link>
        </div>
        <div className="gird grid-cols-1 md:place-self-center">
          <div className="flex flex-col md:w-[766px] space-y-10 justify-center">
            <div className="flex-auto flex flex-col space-y-10">
              <div className="flex flex-col text-marble-white items-center space-y-1">
                <div className="flex flex-col items-center content-center space-y-3">
                  <span className="flex capitalize text-3xl">
                    {initiative?.data.name || "loading..."}
                  </span>
                  <span className="flex text-base md:mx-[60px] text-center">
                    {initiative?.data.oneLiner || "loading..."}
                  </span>
                </div>
                <div className="cursor-pointer">
                  {initiative &&
                    initiative.data.links?.map((item, index) => (
                      <ImageLink link={item} key={index} />
                    ))}
                </div>
              </div>

              <div className="flex flex-col h-auto justify-center">
                <div>
                  {initiative?.data.bannerURL && (
                    <img src={initiative.data.bannerURL} alt="Project banner image." />
                  )}
                </div>
                <div>
                  {initiative && initiative.data.isAcceptingApplications && (
                    <div className="relative h-5 bg-tunnel-black flex overflow-hidden">
                      <div className="whitespace-nowrap text-magic-mint font-lores text-xl w-full">
                        <p>
                          CALLING FOR CONTRIBUTORS. CALLING FOR CONTRIBUTORS. CALLING FOR
                          CONTRIBUTORS. CALLING FOR CONTRIBUTORS.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-4 text-marble-white">
                <div>
                  <span className="text-2xl">About</span>
                </div>
                <div className="flex flex-col space-y-3">
                  {initiative &&
                    initiative.data.contributeText?.map?.((item, index) => {
                      return (
                        <span className="flex flex-col text-base flow-root" key={index}>
                          {item}
                        </span>
                      )
                    })}
                </div>
              </div>
              <div className="text-marble-white flex grid md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <div>
                    <span className="text-2xl">Rewards</span>
                  </div>
                  <div className="space-y-1 flex flex-col">
                    {initiative &&
                      initiative.data.rewardText?.map?.((reward, index) => {
                        return (
                          <span key={index} className="text-base">
                            {reward}
                          </span>
                        )
                      })}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-2xl">Commitment</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base">{initiative && initiative.data.commitment}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-2xl">Skills</span>
                  </div>
                  <div className="flex flex-wrap">
                    {initiative &&
                      initiative.data.skills?.map?.((skill, index) => {
                        return (
                          <Tag key={index} type={"skill"}>
                            {skill}
                          </Tag>
                        )
                      })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-row">
                  <span className="flex-1 text-marble-white text-2xl">Contributors</span>
                </div>
                <div className="flex grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3">
                  {results?.map?.((contributor, index) => {
                    return contributor
                  })}
                </div>
                <div className="flex flex-row">
                  <div className="flex-1 flex justify-start">
                    {hasPrev && (
                      <div
                        onClick={() => setPage(page - 1)}
                        className="cursor-pointer flex justify-self-start rotate-180"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 5.98753L5.97062 -1.05421e-06L5.001 0.974387L9.31593 5.3109L-2.83594e-06 5.3109L-3.07691e-06 6.6891L9.31593 6.6891L5.001 11.0256L5.97061 12L12 5.98753Z"
                            fill="#F2EFEF"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-row justify-center">
                      {[...Array(totalPages)].map((_, idx) => {
                        return (
                          <span
                            key={idx}
                            className={`h-1 w-1  rounded-full mr-1 ${
                              page === idx ? "bg-marble-white" : "bg-concrete"
                            }`}
                          ></span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex-1 flex justify-end">
                    {hasNext && (
                      <div
                        onClick={() => setPage(page + 1)}
                        className="cursor-pointer flex justify-self-end"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 5.98753L5.97062 -1.05421e-06L5.001 0.974387L9.31593 5.3109L-2.83594e-06 5.3109L-3.07691e-06 6.6891L9.31593 6.6891L5.001 11.0256L5.97061 12L12 5.98753Z"
                            fill="#F2EFEF"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {initiative?.data.isAcceptingApplications ? (
              <>
                <div className="flex-auto flex flex-col text-marble-white space-y-5">
                  <div>
                    <span className="text-2xl">What&apos;s next?</span>
                  </div>
                  <div className="flex grid md:grid-cols-3 gap-3">
                    <div className="flex-1 space-y-4">
                      <div>
                        <Image src={StepOne} alt="Step one." width={24} height={24} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <span className="font-bold">Submit interest</span>
                        <div>
                          <span className="text-base">
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
                          <span className="text-base">
                            Reach out to contributors to get to know them and see how you can help.
                            Trust us, endorsements from contributors help.
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
                          <span className="text-base">
                            If selected, a team member will reach out to officially onboard you.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-auto flex justify-center mt-10 sticky bottom-0 bg-tunnel-black">
                  {hasApplied ? (
                    <button className="m-2 py-2 text-center text-base bg-concrete rounded item-center w-[280px]">
                      {`You've already applied!`}
                    </button>
                  ) : (
                    <button
                      className="m-2 py-2 text-center text-base bg-magic-mint rounded item-center w-[280px]"
                      onClick={() => {
                        setUserTrigged(true)
                        setActiveModal()
                      }}
                    >
                      Submit Interest
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="h-[100px]"></div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

Project.suppressFirstRenderFlicker = true
Project.getLayout = (page) => <Layout title="Project">{page}</Layout>

export default Project
