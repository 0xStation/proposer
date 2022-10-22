import { createMachine } from "xstate"

const proposalPaymentMachine = createMachine(
  {
    predictableActionArguments: true,
    id: "proposalPayment",
    initial: "awaitingApproval",
    context: {},
    states: {},
  },
  {
    guards: {},
  }
)

export default proposalPaymentMachine
