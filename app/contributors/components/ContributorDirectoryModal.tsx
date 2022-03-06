import Modal from "../../core/components/Modal"
import Verified from "/public/check-mark.svg"
import { Image, invoke, Link, Routes, useParam } from "blitz"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import Exit from "/public/exit-button.svg"
import DiscordIcon from "/public/discord-icon.svg"
import { Account } from "app/account/types"
import { Initiative } from "app/initiative/types"
import InitiativeCard from "app/initiative/components/InitiativeCard"
import getInitiativesByContributor from "app/initiative/queries/getInitiativesByContributor"
import { truncateString } from "app/core/utils/truncateString"
import { formatDate } from "app/core/utils/formatDate"
import { Tag } from "app/core/components/Tag"

type ContributorDirectoryModalProps = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  contributor?: Account
  terminalId?: number
}
const ContributorDirectoryModal: React.FC<ContributorDirectoryModalProps> = ({
  contributor,
  isOpen,
  setIsOpen,
  terminalId,
}) => {
  const terminalHandle = useParam("terminalHandle", "string") as string
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

  return (
    <div>
      <Modal subtitle="" open={isOpen} toggle={setIsOpen} showTitle={false}>
        <div className="flex flex-col overflow-y-scroll">
          <div className="absolute top-1 left-2">
            <div className="w-[12px] h-[12px]">
              <button className="text-marble-white" onClick={() => setIsOpen(false)}>
                <Image src={Exit} alt="Close button" width={12} height={12} />
              </button>
            </div>
          </div>
          {contributor?.joinedAt && (
            <div className="absolute top-2 right-2 z-50">
              <span className="text-xs text-concrete font-normal">
                {`JOINED SINCE ${formatDate(contributor.joinedAt)}`}
              </span>
            </div>
          )}
          <div className="flex flex-row">
            <div className="mr-2">
              {contributor?.data?.pfpURL ? (
                <img
                  src={contributor?.data?.pfpURL}
                  alt="PFP"
                  className="h-[52px] w-[52px] min-w-[52px] border border-marble-white rounded-full"
                />
              ) : (
                <div className="h-[52px] w-[52px] bg-gradient-to-b to-magic-mint from-electric-violet border border-marble-white rounded-full"></div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row flex-1">
                <div className="text-xl text-marble-white mr-1">{contributor?.data?.name}</div>
                <img
                  className="mt-1"
                  src="/check-mark.svg"
                  alt="Verified icon"
                  width={14}
                  height={14}
                />
              </div>
              <div className="flex-1 text-sm text-concrete">
                {truncateString(contributor?.data?.ens || contributor?.address)}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col text-marble-white space-y-8">
            <div className="flex flex-row">
              <div className="flex flex-col flex-1">
                <span className="font-bold">Role</span>
                <div className="text-xs font-normal flex flex-row mt-2">
                  {contributor?.role && contributor?.role !== "N/A" ? (
                    <Tag type="role">{contributor?.role}</Tag>
                  ) : (
                    <span className="text-concrete mt-2">N/A</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <div className="font-bold">
                  <span>Skills</span>
                </div>
                <div className="text-sm font-normal">
                  <div className="flex flex-row flex-wrap">
                    {(contributor?.skills?.length &&
                      contributor?.skills?.map?.((skill, index) => {
                        return (
                          <Tag key={index} type="skill">
                            {skill}
                          </Tag>
                        )
                      })) || <span className="text-concrete mt-2">N/A</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row pb-8 border-b border-concrete">
              <div className="flex flex-col flex-1">
                <div className="font-bold">
                  <span>Contact</span>
                </div>
                <div className="text-sm flex flex-row space-x-2 mt-2">
                  <Image src={DiscordIcon} alt="Discord icon" width={16} height={13} />
                  <span>@{contributor?.data?.discordId}</span>
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <div className="font-bold">
                  <span>Timezone</span>
                </div>
                <span className="text-sm mt-2">
                  {contributor?.data?.timezone ? (
                    `GMT ${contributor?.data?.timezone}`
                  ) : (
                    <span className="text-concrete mt-2">N/A</span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col mt-8">
            <div className="flex-auto text-marble-white font-bold">Initiatives</div>
            {initiatives && initiatives.length ? (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
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
                          contributors={initiative?.contributors}
                          isAcceptingApplications={initiative?.data?.isAcceptingApplications}
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
      </Modal>
    </div>
  )
}

export default ContributorDirectoryModal
