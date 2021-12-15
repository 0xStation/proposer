import { BlitzPage, useRouterQuery } from "blitz"
import Layout from "app/core/layouts/Layout"

const TerminalPage: BlitzPage = () => {
  const { selectedUser, selectedTerminal } = useRouterQuery()

  return (
    <main className="w-screen h-screen">
      <h1>{`Welcome ${selectedUser}!`}</h1>
      <div className="float-left">{`Terminal Page for ${selectedTerminal}`}</div>
    </main>
  )
}

TerminalPage.suppressFirstRenderFlicker = true
TerminalPage.getLayout = (page) => <Layout title="TerminalPage">{page}</Layout>

export default TerminalPage
