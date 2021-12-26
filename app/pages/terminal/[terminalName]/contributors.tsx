import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import InitiativeCard from "app/terminal/components/InitiativeCard"

const TerminalContributorsPage: BlitzPage = () => {
  return (
    <TerminalNavigation>
      <span className="text-marble-white">COMING SOON</span>
    </TerminalNavigation>
  )
}

TerminalContributorsPage.suppressFirstRenderFlicker = true
TerminalContributorsPage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalContributorsPage
