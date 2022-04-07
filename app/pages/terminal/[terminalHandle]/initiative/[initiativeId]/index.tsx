import { useState, useEffect, useMemo } from "react"
import { useAccount } from "wagmi"
import { Image, useQuery, BlitzPage, useParam, useRouter, useRouterQuery, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import ImageLink from "app/core/components/ImageLink"
import getInitiativeByLocalId from "app/initiative/queries/getInitiativeByLocalId"
import ContributorDirectoryModal from "app/contributors/components/ContributorDirectoryModal"
import Back from "/public/back-icon.svg"
import { Account } from "app/account/types"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import useStore from "app/core/hooks/useStore"
import usePagination from "app/core/hooks/usePagination"
import Tag from "app/core/components/Tag"
import { ProfileMetadata } from "app/core/ProfileMetadata"
import Card from "app/core/components/Card"
import { formatDate } from "app/core/utils/formatDate"
import Button from "app/core/components/Button"
import { QUERY_PARAMETERS } from "app/core/utils/constants"
import { getInitiativeStatusColor } from "app/utils/initiativeStatusOptions"

const Project: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const initiativeLocalId = useParam("initiativeId", "number") as number
  const [hasApplied, setHasApplied] = useState(false)
  const [{ data: accountData }] = useAccount()
  const activeUser = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const [page, setPage] = useState(0)
  const [userTriggered, setUserTrigged] = useState(false)
  const address = useMemo(() => accountData?.address, [accountData?.address])
  const [contributorDirectoryModalIsOpen, setContributorDirectoryModalOpen] = useState(false)
  const [selectedContributorToView, setSelectedContributorToView] = useState<Account | null>(null)
  const { DIRECTED_FROM, SET_TAB } = QUERY_PARAMETERS
  const router = useRouter()
  const { directedFrom, address: addressParam } = useRouterQuery()

  const handleSubmitInterestClick = () => {
    if (address) {
      if (activeUser) {
        // user already has an account, redirect to application creation
        router.push(
          Routes.TerminalInitiativeContributePage({
            terminalHandle,
            initiativeId: initiativeLocalId,
          })
        )
      } else {
        // user is connected but doesn't have an account
        router.push("/profile/create")
      }
    } else {
      // user isn't connected
      toggleWalletModal(true)
    }
  }

  useEffect(() => {
    toggleWalletModal(false)
    let handler
    if (userTriggered) {
      handler = setTimeout(() => handleSubmitInterestClick(), 550)
    }
    return () => {
      clearTimeout(handler)
    }
  }, [address, activeUser])

  useEffect(() => {
    if (terminal) {
      if (activeUser && initiativeLocalId) {
        let currentInit = activeUser.initiatives?.find(
          (init) =>
            init.initiative.localId === initiativeLocalId &&
            init.initiative.terminalId == terminal.id
        )
        if (currentInit) {
          setHasApplied(true)
        }
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
    const {
      role,
      address,
      data: { pfpURL, name, ens, pronouns, verified },
      joinedAt,
    } = contributor
    let onClick

    onClick = () => {
      setSelectedContributorToView(contributor)
      setContributorDirectoryModalOpen(true)
    }

    return (
      <Card onClick={onClick} key={idx}>
        <ProfileMetadata
          {...{ pfpURL, name, ens, pronouns, role, address, verified, className: "mx-3 my-3" }}
        />
        <div className="flex flex-row flex-1 mx-3">
          <div className="flex-1 items-center justify-center text-base">
            {role && role !== "N/A" ? (
              <Tag type={"role"}>{role}</Tag>
            ) : (
              <p className="text-marble-white">N/A</p>
            )}
          </div>
        </div>
        <div className="flex flex-row flex-1 mx-3 mt-3.5">
          <div className="flex-1 items-center justify-center text-xs text-concrete">
            {`JOINED SINCE ${formatDate(joinedAt)}`}
          </div>
        </div>
      </Card>
    )
  })

  const { results, totalPages, hasNext, hasPrev } = usePagination(contributorCards, page, 3)

  return (
    <Layout title={`${initiative?.data.name || "Initiative"}`}>
      {selectedContributorToView && (
        <ContributorDirectoryModal
          contributor={selectedContributorToView}
          isOpen={contributorDirectoryModalIsOpen}
          setIsOpen={setContributorDirectoryModalOpen}
          terminalId={terminal?.id || 0}
        />
      )}
      <main className="w-full min-h-[calc(100vh-6rem)] bg-tunnel-black flex flex-col px-6 sm:px-0 sm:p-3 pb-6">
        <div className="flex sm:mx-1 md:mx-4 my-4 ml-[-.5rem] sm:ml-0">
          <button
            onClick={() => {
              if (directedFrom === DIRECTED_FROM.PROFILE) {
                router.push(`/profile/${addressParam}?setTab=${SET_TAB.INITIATIVES}`)
              } else {
                router.push(`/terminal/${terminalHandle}/initiative-board`)
              }
            }}
          >
            <Image className="cursor-pointer" src={Back} alt="Back Icon" width={25} height={22} />
          </button>
        </div>
        <div className="gird grid-cols-1 md:place-self-center">
          <div className="flex flex-col md:w-[766px] space-y-10 justify-center">
            <div className="flex-auto flex flex-col space-y-10 pb-12">
              <div className="mx-auto flex flex-row items-center">
                <span
                  className={`h-2 w-2 block rounded-full mr-2 bg-${getInitiativeStatusColor(
                    initiative?.data.status
                  )}`}
                />
                <span className="text-center text-marble-white uppercase text-xs tracking-wide">
                  {initiative?.data.status}
                </span>
              </div>
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
                  {initiative?.data.link && <ImageLink link={initiative.data.link} />}
                </div>
              </div>
              <div>
                {initiative?.data.bannerURL && (
                  <img src={initiative.data.bannerURL} alt="Project banner image." />
                )}
              </div>
              {/* {initiative?.data.about && <ReadonlyTextarea value={initiative.data.about} />} */}
              <div className="flex flex-col space-y-3">
                {initiative &&
                  initiative.data.contributeText?.map?.((item, index) => {
                    return (
                      <span className="flex flex-col text-base" key={index}>
                        <p dangerouslySetInnerHTML={{ __html: item }} />
                      </span>
                    )
                  })}
              </div>
              {results.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-row">
                    <span className="flex-1 text-marble-white text-2xl">Team</span>
                  </div>
                  <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3">
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
              )}
              <div className="text-marble-white flex flex-col space-y-8">
                {initiative && initiative.data.rewardText && initiative.data.rewardText.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-2xl">Rewards</span>
                    <div className="flex flex-col">
                      {initiative.data.rewardText?.map?.((reward, index) => {
                        return <span key={index}>{reward}</span>
                      })}
                    </div>
                  </div>
                )}
                {initiative && initiative.data.commitment && (
                  <div className="space-y-2">
                    <span className="text-2xl">Commitment</span>
                    <div>
                      <span>{initiative.data.commitment}</span>
                    </div>
                  </div>
                )}
                {initiative && initiative.skills.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-2xl">Skills</span>
                    <div className="flex flex-wrap">
                      {initiative.skills?.map?.((skill, index) => {
                        return (
                          <Tag key={index} type={"skill"}>
                            {skill.name}
                          </Tag>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {initiative?.data.isAcceptingApplications && (
              <div className="flex-auto flex justify-center mt-10 sticky bottom-0">
                {hasApplied ? (
                  <button className="m-2 py-2 text-center text-base bg-concrete rounded item-center w-[280px]">
                    {`You've already applied!`}
                  </button>
                ) : (
                  <Button
                    className="m-2 py-2 text-center text-base w-[280px]"
                    onClick={() => {
                      setUserTrigged(true)
                      handleSubmitInterestClick()
                    }}
                  >
                    Submit a Proposal
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  )
}

Project.suppressFirstRenderFlicker = true

export default Project
