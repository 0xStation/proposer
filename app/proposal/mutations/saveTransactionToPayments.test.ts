import db from "db"
import saveTransactionHashToPayments from "./saveTransactionToPayments"

/**
 * Current there are a few different places that call saveTransactionToPayments
 *
 * 1. AttachTransactionModal
 *    Called when we are attaching a transaction directly to a payment.
 *
 * 2. ExecutePaymentModal
 *    Called when the client is a wallet (not a safe) so the options are to attach a transaction directly
 *    or to queue a payment and execute it.
 *
 * 3. QueueGnosisTransactionModal
 *    Similar to ExecutePaymentModal, except the client is a gnosis safe. The options are to attach a transaction
 *    or to queue a payment via gnosis.
 *
 * 4. parse-gnosis-tx (webhook API endpoint)
 *    When the webhook responds to an incoming message, and the message is successful, it calls
 *    saveTransactionHashToPayments to mark the payment as complete.
 *
 * There are a few different states a proposal can be in when saveTransactionPayment is applied.
 * Since saveTransactionPayment alters the 'history' state of the proposal, we need to make sure
 * this mutation is working for a variety of possible histories.
 */

afterAll(async () => {
  const deleteProposals = db.proposal.deleteMany()
  const deleteMilestones = db.proposalMilestone.deleteMany()
  await db.$transaction([deleteProposals, deleteMilestones])
  await db.$disconnect()
})

// when a payment is from a client with type client, no history is queued
// until after the payment is complete.
test("Save transaction to payment with no current history", async () => {
  const proposal = await db.proposal.create({
    data: {
      version: 1,
      currentMilestoneIndex: 0,
      data: {},
    },
  })

  const milestone = await db.proposalMilestone.create({
    data: {
      proposalId: proposal.id,
      index: 0,
      data: {},
    },
  })

  const payment = await db.proposalPayment.create({
    data: {
      proposalId: proposal.id,
      milestoneId: milestone.id,
      senderAddress: "",
      recipientAddress: "",
      data: {},
    },
  })

  expect(payment?.transactionHash).toBeNull()

  await saveTransactionHashToPayments({
    milestoneId: milestone.id,
    proposalId: proposal.id,
    paymentId: payment.id,
    transactionHash: "hash",
  })

  const updatedPayment = await db.proposalPayment.findUnique({
    where: { id: payment.id },
  })

  expect(updatedPayment?.transactionHash).toBeDefined()
})

test("Save transaction to payment with a single queued history", async () => {})
test("Save transaction to payment with no current history", async () => {})

// need to export empty to satisfy typescript
export {}
