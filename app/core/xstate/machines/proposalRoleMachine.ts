import { createMachine, assign } from "xstate"

type ProposalRoleContext = {
  quorum: number
  signedCount: number
}

const proposalRoleMachine = createMachine(
  {
    predictableActionArguments: true,
    id: "proposalRole",
    initial: "awaitingApproval",
    context: {
      quorum: 2, // default
      signedCount: 0,
    },
    states: {
      awaitingApproval: {
        on: {
          SIGN: {
            target: "signing",
          },
        },
      },
      signing: {
        // Eventless transition
        // Will transition to either 'awaitingApproval' or 'approved' immediately upon
        // entering 'signing' state or receiving SIGN event
        // if the condition is met.
        always: [
          { target: "awaitingApproval", cond: "quorumNotReached" },
          { target: "approved", cond: "quorumReached" },
        ],
        entry: assign({
          signedCount: (context: ProposalRoleContext, _event) => {
            return context.signedCount + 1
          },
        }),
      },
      approved: { type: "final" },
    },
  },
  {
    guards: {
      quorumReached: (context, _event) => {
        return context.signedCount >= context.quorum
      },
      quorumNotReached: (context, _event) => {
        return context.signedCount < context.quorum
      },
    },
  }
)

export default proposalRoleMachine
