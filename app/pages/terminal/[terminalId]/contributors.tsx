import { useState } from "react"
import { BlitzPage, useQuery, useParam } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import getAllAccounts from "app/account/queries/getAllAccounts"
import ContributorCard from "app/core/components/ContributorCard"
import { Account } from "app/account/types"
import EndorseContributorModal from "app/contributors/components/EndorseContributorModal"
import useStore from "app/core/hooks/useStore"

const TerminalContributorsPage: BlitzPage = () => {
  // TODO: get accounts by terminal id
  let [contributors] = useQuery(getAllAccounts, {}, { suspense: false })
  if (!contributors) {
    contributors = []
  }

  let [endorseModalIsOpen, setEndorseModalIsOpen] = useState(false)
  let [selectedUserToEndorse, setSelectedUserToEndorse] = useState<Account | null>(null)
  const openEndorseModal = () => setEndorseModalIsOpen(!endorseModalIsOpen)
  const activeUser: Account | null = useStore((state) => state.activeUser)
  const accepted = true
  const endorse = false
  return (
    <TerminalNavigation>
      {contributors.length ? (
        <>
          <EndorseContributorModal
            isOpen={endorseModalIsOpen}
            setIsOpen={setEndorseModalIsOpen}
            selectedUserToEndorse={selectedUserToEndorse}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributors.length &&
              contributors
                .filter(
                  (contributor) =>
                    typeof contributor.data.ticketId === "number" && contributor.data.ticketId >= 0
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
