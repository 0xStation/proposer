import { BlitzPage } from "blitz"
import { useMachine } from "@xstate/react"
import proposalMachine from "app/core/xstate/machines/proposalMachine"
import proposalRoleMachine from "app/core/xstate/machines/proposalRoleMachine"

const XState: BlitzPage = () => {
  const [state, send] = useMachine(proposalMachine)

  return (
    <>
      <div className="w-[800px] mx-auto mt-12 border border-marble-white p-12">
        <h1>PROPOSAL</h1>
        <p>state: {state.value}</p>
        <p>author: {state.context.author.state.value}</p>
        <p>client: {state.context.client.state.value}</p>
        <p>contributor: {state.context.contributor.state.value}</p>
        {state.value === "draft" && <button onClick={() => send("SEND")}>SEND</button>}
        <div className="space-x-4">
          {state.value === "awaitingApproval" && (
            <button onClick={() => send("APPROVE_AUTHOR")}>Approve author</button>
          )}
          {state.value === "awaitingApproval" && (
            <button onClick={() => send("APPROVE_CLIENT")}>Approve client</button>
          )}
          {state.value === "awaitingApproval" && (
            <button onClick={() => send("APPROVE_CONTRIBUTOR")}>Approve contributor</button>
          )}
        </div>
      </div>
    </>
  )
}

export default XState
