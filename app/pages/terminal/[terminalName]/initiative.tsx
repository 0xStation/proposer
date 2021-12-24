import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import InitiativeCard from "app/terminal/components/InitiativeCard"

const TerminalInitiativePage: BlitzPage = () => {
  return (
    <TerminalNavigation>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InitiativeCard title="protocol v1" description="ok" contributors={[]} />
        <InitiativeCard title="protocol v1" description="ok" contributors={[]} />
        <InitiativeCard title="protocol v1" description="ok" contributors={[]} />
      </div>
    </TerminalNavigation>
  )
}

TerminalInitiativePage.suppressFirstRenderFlicker = true
TerminalInitiativePage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalInitiativePage
