import { useEffect, useState } from "react"
import { BlitzPage, useQuery, useParam } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getAccountsByRole from "app/account/queries/getAccountsByRole"
import ContributorCard from "app/core/components/ContributorCard"
import { Account } from "app/account/types"
import EndorseContributorModal from "app/contributors/components/EndorseContributorModal"
import useStore from "app/core/hooks/useStore"

const TerminalContributorsPage: BlitzPage = () => {
  // TODO: get accounts by terminal id

  let [endorseModalIsOpen, setEndorseModalIsOpen] = useState(false)
  let [selectedUserToEndorse, setSelectedUserToEndorse] = useState<Account | null>(null)
  let [selectedRole, setRole] = useState("STAFF")
  let [selectedContributors, setSelectedContributors] = useState<Account[] | null>(null)
  const openEndorseModal = () => setEndorseModalIsOpen(!endorseModalIsOpen)
  const activeUser: Account | null = useStore((state) => state.activeUser)

  const accepted = true
  const endorse = false

  const roles = ["STAFF", "COMMUTER", "VISITOR"]

  let [contributors] = useQuery(getAccountsByRole, { role: selectedRole }, { suspense: false })
  if (!contributors) {
    contributors = []
  }

  // const sorted = (role)=>{
  //   all
  //   return ()
  // }

  useEffect(() => {
    // if (!allContributors){
    //   setSelectedContributors(null)
    // } else {
    //   const roleContributors =  allContributors.forEach(sorted(selectedRole))
    // }
  }, [selectedRole])

  return (
    <TerminalNavigation>
      {contributors ? (
        <>
          <EndorseContributorModal
            isOpen={endorseModalIsOpen}
            setIsOpen={setEndorseModalIsOpen}
            selectedUserToEndorse={selectedUserToEndorse}
          />
          <div className="flex flex-col space-y-10">
            <div className="flex-auto flex-wrap space-x-3 text-marble-white text-sm space-y-3">
              {roles.map((role, index) => {
                return (
                  <button
                    key={index}
                    id={role}
                    onClick={() => {
                      setRole(role)
                    }}
                    className={`${
                      selectedRole == role && "bg-marble-white text-tunnel-black"
                    } border border-marble-white rounded-xl h-[29px] ${
                      selectedRole != role && "border border-marble-white"
                    } active:bg-marble-white active:text-tunnel-black`}
                  >
                    <span className="m-4">{role}</span>
                  </button>
                )
              })}
            </div>
            {contributors.length ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contributors.length &&
                  contributors
                    .filter(
                      (contributor) =>
                        typeof contributor.data.ticketId === "number" &&
                        contributor.data.ticketId >= 0
                    )
                    .map((contributor, index) => (
                      <ContributorCard
                        key={index}
                        contributor={contributor as Account}
                        endorse={endorse}
                        accepted={accepted}
                        openEndorseModal={openEndorseModal}
                        setSelectedUserToEndorse={setSelectedUserToEndorse}
                        activeUser={activeUser}
                      />
                    ))}
              </div>
            ) : (
              <div className="text-marble-white">
                There are no {selectedRole.toLowerCase()}s in this terminal.
              </div>
            )}
          </div>
        </>
      ) : (
        <span className="text-marble-white">COMING SOON</span>
      )}
    </TerminalNavigation>
  )
}

TerminalContributorsPage.suppressFirstRenderFlicker = true
TerminalContributorsPage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalContributorsPage
