import { useEffect, useState } from "react"
import { BlitzPage, useQuery, useParam, invoke } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getAccountsByTerminalRole from "app/account/queries/getAccountsByTerminalRole"
import getRolesByTerminal from "app/role/queries/getRolesByTerminal"
import { Account } from "app/account/types"
import ContributorDirectoryModal from "app/contributors/components/ContributorDirectoryModal"
import { Pill } from "app/core/components/Pill"
import { Card } from "app/core/components/Card"
import { Tag } from "app/core/components/Tag"
import ProfileMetadata from "app/core/ProfileMetadata"

const TerminalContributorsPage: BlitzPage = () => {
  const [contributorDirectoryModalIsOpen, setContributorDirectoryModalOpen] = useState(false)
  const [selectedContributorToView, setSelectedContributorToView] = useState<Account | null>(null)
  const [selectedRoleLocalId, setRoleLocalId] = useState<number>(1)
  const [selectedContributors, setSelectedContributors] = useState<Account[] | null>(null)

  const terminalHandle = useParam("terminalHandle") as string

  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const [roles] = useQuery(
    getRolesByTerminal,
    { terminalId: terminal?.id || 0 },
    { suspense: false }
  )

  useEffect(() => {
    if (selectedRoleLocalId) {
      const getContributorsByRole = async () => {
        let contributors = await invoke(getAccountsByTerminalRole, {
          terminalId: terminal?.id || 0,
          roleLocalId: selectedRoleLocalId,
        })
        setSelectedContributors(contributors)
      }
      getContributorsByRole()
    }
  }, [selectedRoleLocalId])

  const contributorCards = selectedContributors?.map((contributor, idx) => {
    const {
      role,
      address,
      data: { pfpURL, name, ens, pronouns, verified },
    } = contributor

    let onClick
    if (role) {
      onClick = () => {
        setSelectedContributorToView(contributor)
        setContributorDirectoryModalOpen(true)
      }
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
      </Card>
    )
  })

  const contributorDirectoryView = roles ? (
    <>
      {selectedContributorToView && (
        <ContributorDirectoryModal
          contributor={selectedContributorToView}
          isOpen={contributorDirectoryModalIsOpen}
          setIsOpen={setContributorDirectoryModalOpen}
          terminalId={terminal?.id || 0}
        />
      )}
      <div className="flex flex-col space-y-10">
        <div className="flex-auto flex-wrap space-x-3 text-marble-white text-sm">
          {roles.map((role, index) => {
            return (
              <Pill
                key={index.toString()}
                active={selectedRoleLocalId == role.localId}
                onClick={() => {
                  setRoleLocalId(role.localId)
                }}
              >
                {`${role.data.name} (${role.ticketCount})`}
              </Pill>
            )
          })}
        </div>
        {!selectedContributors || !selectedContributors.length ? (
          <div className="text-marble-white">
            {selectedRoleLocalId ? (
              <div>There are no contributors with this role.</div>
            ) : (
              <div>Please select a role to view contributors.</div>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{contributorCards}</div>
        )}
      </div>
    </>
  ) : (
    <span className="text-marble-white">This terminal does not have any contributors yet.</span>
  )

  return <TerminalNavigation>{contributorDirectoryView}</TerminalNavigation>
}

TerminalContributorsPage.suppressFirstRenderFlicker = true
TerminalContributorsPage.getLayout = (page) => <Layout title="Contributors">{page}</Layout>

export default TerminalContributorsPage
