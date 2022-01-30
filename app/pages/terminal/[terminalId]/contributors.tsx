import { useEffect, useState } from "react"
import { BlitzPage, useQuery, useParam, invoke } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getAccountsByRole from "app/account/queries/getAccountsByRole"
// import ContributorCard from "app/core/components/ContributorCard"
import { Account } from "app/account/types"
import EndorseContributorModal from "app/contributors/components/EndorseContributorModal"
import { Pill } from "app/core/components/Pill"
import useStore from "app/core/hooks/useStore"
import { TalentIdentityUnit as ContributorCard } from "app/core/components/TalentIdentityUnit/index"

const TerminalContributorsPage: BlitzPage = () => {
  const [endorseModalIsOpen, setEndorseModalIsOpen] = useState(false)
  const [selectedUserToEndorse, setSelectedUserToEndorse] = useState<Account | null>(null)
  const [selectedRole, setRole] = useState("STAFF")
  const [selectedContributors, setSelectedContributors] = useState<Account[] | null>(null)
  const openEndorseModal = () => setEndorseModalIsOpen(!endorseModalIsOpen)
  const activeUser: Account | null = useStore((state) => state.activeUser)

  const accepted = true
  const endorse = false

  const roles = ["STAFF", "COMMUTER", "VISITOR"]

  useEffect(() => {
    // if (!allContributors){
    //   setSelectedContributors(null)
    // } else {
    //   const roleContributors =  allContributors.forEach(sorted(selectedRole))
    // }
    if (selectedRole) {
      const getApplicationsFromInitiative = async () => {
        let contributors = await invoke(getAccountsByRole, { role: selectedRole })
        setSelectedContributors(contributors)
      }
      getApplicationsFromInitiative()
    }
  }, [selectedRole])

  const contributorCards = selectedContributors?.map((contributor, idx) => {
    const { id, points, createdAt } = contributor
    const {
      data: { role, timezone },
    } = contributor
    let onClick
    if (role) {
      onClick = () => {
        setSelectedUserToEndorse(contributor)
        setEndorseModalIsOpen(true)
      }
    }

    const contributorCardProps = {
      user: contributor,
      points,
      onClick,
      dateMetadata: createdAt && {
        createdAt,
        timezone,
      },
    }
    return <ContributorCard key={idx} {...contributorCardProps} />
  })

  return (
    <TerminalNavigation>
      {selectedContributors ? (
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
                  <Pill
                    key={index.toString()}
                    active={selectedRole == role}
                    onClick={() => {
                      setRole(role)
                    }}
                  >
                    <span className="m-4">{role}</span>
                  </Pill>
                )
              })}
            </div>
            {/* <div className="flex-auto text-marble-white">
            {!applications || !applications.length ? (
              <div>
                {selectedInitiative ? (
                  <div>There are no active applications for this initiative.</div>
                ) : (
                  <div>Please select an initiative to view applications.</div>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{applicationCards}</div>
            )}
          </div> */}
            {!selectedContributors || !selectedContributors.length ? (
              <div className="text-marble-white">
                {selectedRole ? (
                  <div>There are no {selectedRole.toLowerCase()}s in this terminal.</div>
                ) : (
                  <div>Please select a role to view contributors.</div>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{contributorCards}</div>
            )}
            {/* {contributors.length ? (
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
            )} */}
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
