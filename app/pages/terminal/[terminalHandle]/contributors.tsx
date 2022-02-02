import { useEffect, useState } from "react"
import { BlitzPage, useQuery, useParam, invoke } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getAccountsByRole from "app/account/queries/getAccountsByRole"
import { Account } from "app/account/types"
import ContributorDirectoryModal from "app/contributors/components/ContributorDirectoryModal"
import { Pill } from "app/core/components/Pill"
import { TalentIdentityUnit as ContributorCard } from "app/core/components/TalentIdentityUnit/index"
import { Role } from "app/types"

const TerminalContributorsPage: BlitzPage = () => {
  const [contributorDirectoryModalIsOpen, setContributorDirectoryModalOpen] = useState(false)
  const [selectedContributorToView, setSelectedContributorToView] = useState<Account | null>(null)
  const [selectedRole, setRole] = useState<String>(Role.STAFF)
  const [selectedContributors, setSelectedContributors] = useState<Account[] | null>(null)

  useEffect(() => {
    if (selectedRole) {
      const getContributorsByRole = async () => {
        let contributors = await invoke(getAccountsByRole, { role: selectedRole })
        setSelectedContributors(contributors)
      }
      getContributorsByRole()
    }
  }, [selectedRole])

  const contributorCards = selectedContributors?.map((contributor, idx) => {
    const { id, points, joinedAt, role } = contributor
    const {
      data: { timezone },
    } = contributor
    let onClick
    if (role) {
      onClick = () => {
        setSelectedContributorToView(contributor)
        setContributorDirectoryModalOpen(true)
      }
    }

    const contributorCardProps = {
      user: contributor,
      points,
      onClick,
      dateMetadata: joinedAt && {
        joinedAt,
        timezone,
      },
      referrals: [],
      isEndorsable: false,
    }
    return <ContributorCard key={idx} {...contributorCardProps} />
  })

  const contributorDirectoryView = !selectedContributors ? (
    <span className="text-marble-white">This terminal does not have any contributors yet.</span>
  ) : (
    <>
      {selectedContributorToView && (
        <ContributorDirectoryModal
          contributor={selectedContributorToView}
          isOpen={contributorDirectoryModalIsOpen}
          setIsOpen={setContributorDirectoryModalOpen}
        />
      )}
      <div className="flex flex-col space-y-10">
        <div className="flex-auto flex-wrap space-x-3 text-marble-white text-sm space-y-3">
          {Object.entries(Role).map(([, role], index) => {
            return (
              <Pill
                key={index}
                active={selectedRole === role}
                onClick={() => {
                  setRole(role)
                }}
              >
                <span className="m-4">{role}</span>
              </Pill>
            )
          })}
        </div>
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
      </div>
    </>
  )

  return <TerminalNavigation>{contributorDirectoryView}</TerminalNavigation>
}

TerminalContributorsPage.suppressFirstRenderFlicker = true
TerminalContributorsPage.getLayout = (page) => <Layout title="Contributors">{page}</Layout>

export default TerminalContributorsPage
