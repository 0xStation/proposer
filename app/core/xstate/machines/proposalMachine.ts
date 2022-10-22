import { createMachine } from "xstate"

const proposalMachine = createMachine(
  {
    predictableActionArguments: true,
    id: "proposal",
    initial: "draft",
    context: {
      author: "",
      client: "",
      contributor: "",
      payments: [],
      milestones: [],
    },
    states: {
      draft: {
        on: { FETCH: { target: "awaitingApproval" } },
      },
      awaitingApproval: {
        on: { FETCH: { target: "approved", cond: "allRolesSigned" } },
      },
      approved: {
        on: { FETCH: { target: "complete" } },
      },
      complete: {
        type: "final",
      },
    },
  },
  {
    guards: {
      allRolesSigned: (context, event) => {
        return true
      },
    },
  }
)

export default proposalMachine

// proposal created, proposalMachine instantiated, proposalRoleMachines instantiated for each signer
// author signs to approve proposal (awaiting approval)
// client signs to approve proposal (awaiting approval)
