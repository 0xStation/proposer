import { Dispatch, SetStateAction, useState, useEffect } from "react"
import Verified from "/public/check-mark.svg"
import { Image } from "blitz"
import Staff from "/public/role-staff.svg"
import Commuter from "/public/role-commuter.svg"
import Visitor from "/public/role-visitor.svg"
import { Account } from "app/account/types"
import { useAccount, useBalance } from "wagmi"
import { TERMINAL, DEFAULT_NUMBER_OF_DECIMALS } from "app/core/utils/constants"
import { useDecimals } from "app/core/contracts/contracts"
import { Application } from "app/application/types"

function roleSVG(role) {
  let svg
  if (role === "STAFF") {
    svg = Staff
  } else if (role === "COMMUTER") {
    svg = Commuter
  } else if (role === "VISITOR") {
    svg = Visitor
  }
  return svg
}

type ContributorCardProps = {
  contributor: Account
  accepted: Boolean
  endorse: Boolean
  value?: number
  openEndorseModal?: () => void
  openApplicantModal?: () => void
  setSelectedUserToEndorse?: Dispatch<SetStateAction<Account | null>>
  setSelectedApplicantToView?: Dispatch<SetStateAction<number>>
  activeUser?: Account | null
  application?: Application
}

const ContributorCard: React.FC<ContributorCardProps> = ({
  contributor,
  accepted,
  endorse,
  value,
  openEndorseModal,
  openApplicantModal,
  setSelectedUserToEndorse,
  setSelectedApplicantToView,
  activeUser,
  application,
}) => {
  const isContributorDirectory = openEndorseModal && setSelectedUserToEndorse
  const isWaitingRoom = !accepted

  // I created the following functions for handing the event propagation when  clicking the div and the endorse button inside it but it's not working at the moment
  const handleRequestClick = (event, person, setSelectedUserToEndorse, openEndorseModal) => {
    endorseButtonClick(event, person, setSelectedUserToEndorse, openEndorseModal)
    event.stopPropagation()
  }
  const endorseButtonClick = (event, person, setSelectedUserToEndorse, openEndorseModal) => {
    setSelectedUserToEndorse()
    openEndorseModal()
    event.stopPropagation()
  }

  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const [{ data: balanceData }] = useBalance({
    addressOrName: activeUser?.address,
    token: TERMINAL.TOKEN_ADDRESS,
    watch: true,
    formatUnits: decimals,
  })
  const tokenBalance = parseFloat(balanceData?.formatted || "")

  const isEndorsable = tokenBalance && activeUser && activeUser.address !== contributor.address
  return (
    <div
      className={`flex flex-col flex-auto content-center ${
        endorse && accepted && "w-[240px]"
      } text-marble-white border border-concrete cursor-pointer ${
        !isWaitingRoom && !isContributorDirectory && "w-[240px] min-h-[180px] max-h-[250px]"
      }`}
      onClick={() => {
        if (!accepted && value !== undefined) {
          if (setSelectedApplicantToView && openApplicantModal) {
            openApplicantModal()
            setSelectedApplicantToView(value)
          }
        }
      }}
    >
      <div className="flex flex-row flex-auto content-center mx-3 my-3 space-x-1">
        <div className="flex-2/5 content-center align-middle mr-1">
          {contributor.data.pfpURL ? (
            <div className="flex-2/5 m-auto">
              <img
                src={contributor?.data.pfpURL}
                alt="PFP"
                className="h-[40px] w-[40px] border border-marble-white rounded-full"
              />
            </div>
          ) : (
            <div className="h-[40px] w-[40px] place-self-center border border-marble-white rounded-full place-items-center"></div>
          )}
        </div>
        <div className="flex flex-col flex-1 content-center">
          <div className="flex flex-row items-center flex-1 space-x-1">
            <div className="text-m">{contributor.data.handle}</div>
            <div className="m-auto">
              <Image src={Verified} alt="Verified icon." width={10} height={10} />
            </div>
          </div>
          <div className="flex flex-row flex-1 text-xs text-concrete space-x-1 overflow-hidden">
            <div className="max-w-[150px] truncate">
              {contributor.data.wallet || contributor.address}
            </div>
            <div className="">-</div>
            <div className="">{contributor.data.pronouns}</div>
          </div>
        </div>
      </div>
      {accepted === true ? (
        <div>
          <div className="flex flex-row flex-1 mx-3">
            <div className="flex-1 items-center justify-center text-sm">
              <div className="place-self-center mt-2">Role</div>
            </div>

            <div className="flex flex-1 align-right place-content-end content-right text-sm">
              <Image
                className="content-right text-sm"
                src={roleSVG(contributor?.data.role)}
                alt="Role icon."
                height={17}
              />
            </div>
          </div>
          <div className="flex flex-row flex-1 mx-3">
            <div className="flex-1 items-center justify-center text-sm">
              <div className="place-self-center mt-2">Endorsers</div>
            </div>

            <div className="flex flex-1 align-right place-content-end content-right text-sm">
              <div className="flex flex-row">
                <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block"></span>
                <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-5px]"></span>
                <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-5px]"></span>
              </div>
            </div>
          </div>
          <div className="flex flex-row flex-1 mx-3 ">
            <div className="flex-1 items-center justify-center text-sm mt-2">Points</div>
            <div className="flex-1 text-right justify-end content-end text-sm">
              <span>RAILS</span>
            </div>
          </div>
          {setSelectedUserToEndorse &&
          openEndorseModal &&
          activeUser?.address !== contributor.address ? (
            <div className="flex flex-row align-center justify-center my-2">
              <button
                type="submit"
                className="border-solid border border-magic-mint text-magic-mint hover:bg-concrete w-full mt-0 mb-2 mx-2 rounded"
                onClick={(event) => {
                  handleRequestClick(event, contributor, setSelectedUserToEndorse, openEndorseModal)
                  event.stopPropagation()
                }}
              >
                Endorse
              </button>
            </div>
          ) : (
            <div>
              {isContributorDirectory || (openApplicantModal && setSelectedApplicantToView) ? (
                <div className="flex flex-row align-center justify-center my-2 h-[26px]"></div>
              ) : (
                <div></div>
              )}
            </div>
          )}

          <div className="flex flex-row flex-1 mx-3 ">
            {contributor && application?.createdAt ? (
              <div className="flex-1 items-center justify-center text-xs text-concrete my-2">
                {console.log(JSON.stringify(application?.createdAt.toDateString))}
                {application?.createdAt.toDateString}
              </div>
            ) : (
              <div className="flex-1 items-center justify-center text-xs text-concrete my-2">
                Metadata
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-row flex-1 mx-3">
            <div className="flex-1 items-center justify-center text-sm">
              <div className="place-self-center mt-2">Endorsers</div>
            </div>

            <div className="flex flex-1 align-right place-content-end content-right text-sm">
              <div className="flex flex-row">
                <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block"></span>
                <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-5px]"></span>
                <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-5px]"></span>
              </div>
            </div>
          </div>
          {activeUser && (
            <div className="flex flex-row flex-1 mx-3 ">
              <div className="flex-1 items-center justify-center text-sm mt-2">Points</div>
              <div className="flex-1 text-right justify-end content-end text-sm">
                <span>RAILS</span>
              </div>
            </div>
          )}
          <div className="flex flex-row flex-1 mx-3">
            <div className="flex-1 items-center justify-center text-sm">
              <div className="place-self-center mt-2">Role</div>
            </div>
            <div className="flex flex-1 align-right place-content-end content-right text-sm">
              <span>N/A</span>
            </div>
          </div>
          {openApplicantModal && setSelectedApplicantToView && isEndorsable ? (
            <div className="flex flex-row flex-1 align-center justify-center mt-2">
              <button
                type="submit"
                className="border-solid border border-magic-mint text-magic-mint hover:bg-concrete w-full mt-0 mb-2 mx-2 rounded"
                onClick={() => {}}
              >
                Endorse
              </button>
            </div>
          ) : (
            <div>
              {openApplicantModal &&
              setSelectedApplicantToView &&
              activeUser &&
              activeUser?.address !== contributor.address ? (
                <div className="flex flex-row align-center justify-center my-2 h-[26px]"></div>
              ) : (
                <div></div>
              )}
            </div>
          )}
          {setSelectedUserToEndorse &&
            openEndorseModal &&
            activeUser?.address !== contributor.address && (
              <div
                className="flex flex-row align-center justify-center my-2"
                onClick={(event) => {
                  event.stopPropagation()
                }}
              >
                <button
                  type="submit"
                  className="border-solid border border-magic-mint text-magic-mint hover:bg-concrete w-full mt-0 mb-2 mx-2 rounded"
                  onClick={(event) => {
                    handleRequestClick(
                      event,
                      contributor,
                      setSelectedUserToEndorse,
                      openEndorseModal
                    )
                    event.stopPropagation()
                  }}
                >
                  Endorse
                </button>
              </div>
            )}
          <div className="flex flex-row flex-1 mx-3">
            {application && application.createdAt ? (
              <div className="flex-1 items-center justify-center text-xs text-concrete my-2">
                {console.log(JSON.stringify(application?.createdAt.toDateString))}
                {application?.createdAt.toDateString}
              </div>
            ) : (
              <div className="flex-1 items-center justify-center text-xs text-concrete my-2">
                Metadata
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContributorCard
