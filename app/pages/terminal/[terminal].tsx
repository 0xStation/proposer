import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import InitiativeCard from "app/terminal/components/InitiativeCard"

const TerminalPage: BlitzPage = () => {
  return (
    <TerminalNavigation>
      <div className="grid grid-cols-3 gap-4">
        <InitiativeCard title="protocol v1" description="ok" contributors={[]} />
        <InitiativeCard title="protocol v1" description="ok" contributors={[]} />
        <InitiativeCard title="protocol v1" description="ok" contributors={[]} />
      </div>
    </TerminalNavigation>
  )
}

TerminalPage.suppressFirstRenderFlicker = true
TerminalPage.getLayout = (page) => <Layout title="Terminal">{page}</Layout>

export default TerminalPage
