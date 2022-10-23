import { createMachine, spawn, assign, send } from "xstate"
import proposalRoleMachine from "./proposalRoleMachine"

type ProposalContext = {
  author: any
  client: any
  contributor: any
}

// once the proposal is complete, it's done. There is nothing more for the proposal to do.
// We might care about payments or milestones that are associated to the proposal
// but the status of the payments or milestones do not change the state of the proposal.
const proposalMachine = createMachine(
  {
    predictableActionArguments: true,
    id: "proposal",
    initial: "initializing",
    context: {
      author: "",
      client: "",
      contributor: "",
    },
    states: {
      initializing: {
        always: { target: "draft" },
        entry: assign({
          author: (context, event) => spawn(proposalRoleMachine, { sync: true, name: "author" }),
          client: (context, event) => spawn(proposalRoleMachine, { sync: true, name: "client" }),
          contributor: (context, event) =>
            spawn(proposalRoleMachine, { sync: true, name: "contributor" }),
        }),
      },
      draft: {
        on: { SEND: { target: "awaitingApproval" } },
      },
      awaitingApproval: {
        on: {
          APPROVE_AUTHOR: { target: "approvingAuthor" },
          APPROVE_CLIENT: { target: "approvingClient" },
          APPROVE_CONTRIBUTOR: { target: "approvingContributor" },
        },
      },
      approvingPassThrough: {
        always: [
          { target: "approved", cond: "rolesSigned" },
          { target: "awaitingApproval", cond: "rolesRemaining" },
        ],
      },
      // as far as I can tell we can't pass params to the entry action, so there is no way to make a general
      // approving action that takes the role as a param. We have to have a separate action / state for each role.
      approvingAuthor: {
        // on: {
        //   PROCESSED: { target: "approvingPassThrough" },
        // },
        always: [
          { target: "approved", cond: "rolesSigned" },
          { target: "awaitingApproval", cond: "rolesRemaining" },
        ],
        entry: send("SIGN", {
          to: (context: ProposalContext) => context.author,
        }),
      },
      approvingClient: {
        // on: {
        //   PROCESSED: { target: "approvingPassThrough" },
        // },
        always: [
          { target: "approved", cond: "rolesSigned" },
          { target: "awaitingApproval", cond: "rolesRemaining" },
        ],
        entry: send("SIGN", {
          to: (context: ProposalContext) => context.client,
        }),
      },
      approvingContributor: {
        // on: {
        //   PROCESSED: { target: "approvingPassThrough" },
        // },
        always: [
          { target: "approved", cond: "rolesSigned" },
          { target: "awaitingApproval", cond: "rolesRemaining" },
        ],
        entry: send("SIGN", {
          to: (context: ProposalContext) => context.contributor,
        }),
      },
      approved: {
        on: { COMPLETE: { target: "complete" } },
      },
      complete: {
        type: "final",
      },
    },
  },
  {
    guards: {
      rolesRemaining: (context: ProposalContext, _event) => {
        return (
          context.author.state.value !== "approved" ||
          context.client.state.value !== "approved" ||
          context.contributor.state.value !== "approved"
        )
      },
      rolesSigned: (context: ProposalContext, _event) => {
        // probably a bit of a delay because we are running this cond immediately after running an action that
        // fires on a different machine. So maybe the machine hasn't transitioned yet. Need some sort of await?
        return (
          context.author.getSnapshot().value === "approved" &&
          context.client.getSnapshot().value === "approved" &&
          context.contributor.getSnapshot().value === "approved"
        )
      },
    },
  }
)

export default proposalMachine
