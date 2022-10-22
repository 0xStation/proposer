import proposalRoleMachine from "app/core/xstate/machines/proposalRoleMachine"

it("should approve role after a single signer when quorum is one", () => {
  const expectedValue = "approved"
  const singleSignerRoleMachine = proposalRoleMachine.withContext({ quorum: 1, signedCount: 0 })

  const initialState = singleSignerRoleMachine.initialState
  const actualState = singleSignerRoleMachine.transition(initialState, { type: "SIGN" })

  expect(actualState.matches(expectedValue)).toBeTruthy()
})

it("should remain in awaiting role after a single signer when quorum is greater than one", () => {
  const expectedValue = "awaitingApproval"
  const multiSignerRoleMachine = proposalRoleMachine.withContext({ quorum: 2, signedCount: 0 })

  const initialState = multiSignerRoleMachine.initialState
  const actualState = multiSignerRoleMachine.transition(initialState, { type: "SIGN" })

  expect(actualState.matches(expectedValue)).toBeTruthy()
})

it("should approve role after two signers sign when quorum is two", () => {
  const expectedValue = "approved"
  const multiSignerRoleMachine = proposalRoleMachine.withContext({ quorum: 2, signedCount: 0 })

  const initialState = multiSignerRoleMachine.initialState
  const nextState = multiSignerRoleMachine.transition(initialState, { type: "SIGN" })
  const actualState = multiSignerRoleMachine.transition(nextState, { type: "SIGN" })

  expect(actualState.matches(expectedValue)).toBeTruthy()
})
