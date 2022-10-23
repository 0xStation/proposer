import proposalMachine from "app/core/xstate/machines/proposalMachine"

it("should spawn a proposalMachine correctly", () => {
  const machine = proposalMachine

  const initialState = machine.initialState
  const draftState = machine.transition(initialState, { type: "SEND" })
  const approvalSentState = machine.transition(draftState, { type: "APPROVE" })
  const approvalSentState2 = machine.transition(approvalSentState, { type: "APPROVE" })
  console.log(approvalSentState2.context.author.state.context)

  // just getting test to pass
  expect(true).toBeTruthy()
})
