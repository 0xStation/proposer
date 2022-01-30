import Modal from "../../core/components/Modal"
import Verified from "/public/check-mark.svg"
import { Image, invoke } from "blitz"
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
// import getInitiativesByContributor from "app/initiative/queries/getInitiativesByContributor"

type ContributorDirectoryModalProps = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  contributor?: Account
  activeUser?: Account
}

const ContributorDirectoryModal: React.FC<ContributorDirectoryModalProps> = ({
  contributor,
  isOpen,
  setIsOpen,
}) => {
  const activeUser: Account | null = useStore((state) => state.activeUser)
  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const [{ data: balanceData }] = useBalance({
    addressOrName: activeUser?.address,
    token: TERMINAL.TOKEN_ADDRESS,
    watch: true,
    formatUnits: decimals,
  })
  const [initiatives, setInitiatives] = useState<Initiative[]>()

  // useEffect(() => {
  //   if (isOpen) {
  //     const getInitiativesFromContributor = async () => {
  //       let involvements = await invoke(getInitiativesByContributor, {
  //         contributorId: contributor?.id,
  //       })
  //       setInitiatives(involvements)
  //     }
  //     getInitiativesFromContributor()
  //   }
  // }, [contributor])

  return (
    <div>
      <Modal subtitle="" open={isOpen} toggle={setIsOpen} showTitle={false}>
        <div className="flex flex-col space-y-6">
          <div className="flex flex- auto flex-col space-y-6 overflow-y-scroll">
            <div id="close and meta data" className="flex-auto flex flex-row">
              <div className="flex flex-1 justify-start absolute top-1 left-2">
                <div className="w-[12px] h-[12px]">
                  <button className="text-marble-white" onClick={() => setIsOpen(false)}>
                    <Image src={Exit} alt="Close button" width={12} height={12} />
                  </button>
                </div>
              </div>
              <div className="flex flex-1 justify-end absolute top-2 right-2 z-50">
                {(contributor && contributor.joinedAt !== null) || undefined ? (
                  <span className="text-xs text-concrete font-normal">
                    JOINED SINCE {contributor?.joinedAt?.toDateString}
                  </span>
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
                      {contributor?.data?.handle}
                    </div>
                    <div className="flex-2/5 m-auto">
                      <Image src={Verified} alt="Verified icon." width={10} height={10} />
                    </div>
                  </div>
                  <div className="flex flex-row flex-1 text-sm text-concrete space-x-1">
                    <div className="flex-1">{contributor?.data?.wallet}</div>
                    <div className="flex-1">-</div>
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
                    {contributor?.data?.role ? (
                      <span className="text-xs rounded-lg text-electric-violet bg-[#211831] py-1 px-2">
                        {contributor?.data?.role.toUpperCase()}
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
                      }) || "N/A"}
                    </div>
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
                      <span>@{contributor?.data?.discordId}</span>
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
          </div>
          <div className="flex flex-col space-y-6">
            <div className="flex-auto text-marble-white font-bold">Initiatives</div>
            <div className="flex-auto flex flex-row space-x-3"></div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ContributorDirectoryModal
