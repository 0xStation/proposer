import Modal from "../../core/components/Modal"
import Verified from "/public/check-mark.svg"
import { Image, invoke, Link, Routes, useParam } from "blitz"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Application } from "app/application/types"
import Exit from "/public/exit-button.svg"
import DiscordIcon from "/public/discord-icon.svg"
import { Account } from "app/account/types"
import { useAccount, useBalance } from "wagmi"
import { TERMINAL, DEFAULT_NUMBER_OF_DECIMALS } from "app/core/utils/constants"
import { useDecimals } from "app/core/contracts/contracts"
import useStore from "app/core/hooks/useStore"
import { Initiative } from "app/initiative/types"
import InitiativeCard from "app/initiative/components/InitiativeCard"
import getInitiativesByContributor from "app/initiative/queries/getInitiativesByContributor"
import { truncateString } from "app/core/utils/truncateString"
import { formatDate } from "app/core/utils/formatDate"

type ContributorDirectoryModalProps = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  contributor?: Account
  activeUser?: Account
  terminalId?: number
}
const ContributorDirectoryModal: React.FC<ContributorDirectoryModalProps> = ({
  contributor,
  isOpen,
  setIsOpen,
  terminalId,
}) => {
  const terminalHandle = useParam("terminalHandle", "string") as string
  const activeUser: Account | null = useStore((state) => state.activeUser)
  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const [{ data: balanceData }] = useBalance({
    addressOrName: activeUser?.address,
    token: TERMINAL.TOKEN_ADDRESS,
    watch: true,
    formatUnits: decimals,
  })
  const [initiatives, setInitiatives] = useState<Initiative[]>()

  useEffect(() => {
    if (isOpen) {
      const getInitiativesFromContributor = async () => {
        let involvements = await invoke(getInitiativesByContributor, {
          terminalId,
          accountId: contributor?.id,
        })
        setInitiatives(involvements)
      }
      getInitiativesFromContributor()
    }
  }, [contributor, isOpen])

  let joinedDate
  if (contributor?.joinedAt) {
    const formattedDate = formatDate(contributor.joinedAt)

    joinedDate = `JOINED SINCE ${formattedDate}`
  }

  return (
    <div>
      <Modal subtitle="" open={isOpen} toggle={setIsOpen} showTitle={false}>
        <div className="flex flex-col">
          <div className="flex flex-auto flex-col space-y-6 h-[570px] overflow-y-scroll">
            <div id="close and meta data" className="flex-auto flex flex-row">
              <div className="flex flex-1 justify-start absolute top-1 left-2">
                <div className="">
                  <button className="text-marble-white" onClick={() => setIsOpen(false)}>
                    <Image src={Exit} alt="Close button" width={12} height={12} />
                  </button>
                </div>
              </div>
              <div className="flex flex-1 justify-end absolute top-2 right-2 z-50">
                {(contributor && contributor.joinedAt !== null) || undefined ? (
                  <span className="text-xs text-concrete font-normal">{joinedDate}</span>
                ) : (
                  <span className="text-xs text-concrete font-normal">JOINED SINCE ...</span>
                )}
              </div>
            </div>
            <div id="pfp and handle" className="flex-auto">
              <div className="flex flex-row flex-1 content-center space-x-1">
                <div className="flex-2/5 content-center align-middle mr-1">
                  {contributor?.data?.pfpURL ? (
                    <div className="flex-2/5 m-auto">
                      <img
                        src={contributor?.data?.pfpURL}
                        alt="PFP"
                        className="h-[52px] w-[52px] border border-marble-white rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="h-[40px] w-[40px] place-self-center border border-marble-white rounded-full place-items-center"></div>
                  )}
                </div>
                <div className="flex flex-col flex-3/5 content-center">
                  <div className="flex flex-row flex-1 space-x-1">
                    <div className="flex-3/5 text-xl text-marble-white">
                      {contributor?.data?.name}
                    </div>
                    <div className="flex-2/5 m-auto">
                      <Image src={Verified} alt="Verified icon." width={10} height={10} />
                    </div>
                  </div>
                  <div className="flex flex-row flex-1 text-sm text-concrete space-x-1">
                    <div className="flex-1">
                      {truncateString(contributor?.data?.ens || contributor?.address)}
                    </div>
                    <div className="flex-1">•</div>
                    <div className="flex-1">{contributor?.data?.pronouns}</div>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="person's details"
              className="flex-auto flex flex-col text-marble-white space-y-5"
            >
              <div className="flex flex-row flex-auto">
                <div className="flex flex-col flex-1 text-marble-white">
                  <div className="font-bold">
                    <span>Role</span>
                  </div>
                  <div className="text-xs font-normal flex flex-row content-end">
                    {contributor?.role ? (
                      <span className="text-xs rounded-lg text-electric-violet bg-[#211831] py-1 px-2">
                        {contributor?.role.toUpperCase()}
                      </span>
                    ) : (
                      <span>N/A</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="font-bold text-marble-white">
                    <span>Skills</span>
                  </div>
                  <div className="text-sm font-normal text-neon-carrot">
                    {contributor?.data?.skills && contributor?.data?.skills.length ? (
                      <div className="flex flex-row space-x-2 overflow-x-scroll text-neon-carrot content-end">
                        {contributor?.data?.skills.map((skill, index) => {
                          return (
                            <span
                              key={index}
                              className="text-xs rounded-lg text-neon-carrot bg-[#302013] py-1 px-2"
                            >
                              {skill.toUpperCase()}
                            </span>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-marble-white">N/A</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-row flex-auto text-marble-white">
                <div className="flex flex-col flex-1">
                  <div className="font-bold">
                    <span>Contact</span>
                  </div>
                  <div className="text-sm font-normal flex flex-row space-x-1">
                    <div className="flex content-end">
                      <Image src={DiscordIcon} alt="Discord icon" width={16} height={13} />
                    </div>
                    <div className="">
                      <span>{contributor?.data?.discordId}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col flex-1 text-marble-white">
                  <div className="font-bold">
                    <span>Timezone</span>
                  </div>
                  <div className="text-sm font-normal text-marble-white">
                    <span>{contributor?.data?.timezone || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-auto flex flex-row border border-concrete left-0 right-0 max-h-0"></div>
            <div className="flex flex-col space-y-4">
              <div className="flex-auto text-marble-white font-bold">Initiatives</div>
              {initiatives && initiatives.length ? (
                <div className="grid grid-cols-2 gap-4">
                  {initiatives.map((initiative) => {
                    return (
                      <Link
                        key={initiative.localId}
                        href={Routes.Project({ terminalHandle, initiativeId: initiative.localId })}
                      >
                        <a>
                          <InitiativeCard
                            title={initiative?.data?.name || "Title"}
                            oneLiner={initiative?.data?.oneLiner || "One Liner"}
                            contributors={initiative.contributors}
                            isAcceptingApplications={initiative.data.isAcceptingApplications}
                          />
                        </a>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-marble-white font-normal text-sm">
                  {contributor?.data.name} is not involved in any active initiatives at this time.
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ContributorDirectoryModal
