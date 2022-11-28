import db from "db"
import saveTransactionHashToPayments from "./saveTransactionToPayments"
import { ProposalPayment } from "app/proposalPayment/types"

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

/**
 * Case: wallet, attaach or pay directly.
 */
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
      data: { title: "Upfront payment" },
    },
  })

  const payment = (await db.proposalPayment.create({
    data: {
      proposalId: proposal.id,
      milestoneId: milestone.id,
      senderAddress: "",
      recipientAddress: "",
      amount: 0.001,
      data: {
        token: {
          name: "Goerli ETH",
          type: "COIN",
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
          chainId: 5,
          decimals: 18,
        },
        history: [],
      },
    },
  })) as ProposalPayment

  expect(payment?.data?.history.length).toBe(0)

  await saveTransactionHashToPayments({
    milestoneId: milestone.id,
    proposalId: proposal.id,
    paymentId: payment.id,
    transactionHash: "HASH",
  })

  const updatedPayment = (await db.proposalPayment.findUnique({
    where: { id: payment.id },
  })) as ProposalPayment

  expect(updatedPayment?.data?.history.length).toBe(1)
})

/**
 * Case: gnosis safe, approve 1st transaction, one is currently queued.
 */
test("Save transaction to payment with a single queued history", async () => {
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
      data: { title: "Upfront payment" },
    },
  })

  const payment = (await db.proposalPayment.create({
    data: {
      proposalId: proposal.id,
      milestoneId: milestone.id,
      senderAddress: "",
      recipientAddress: "",
      amount: 0.001,
      data: {
        token: {
          name: "Goerli ETH",
          type: "COIN",
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
          chainId: 5,
          decimals: 18,
        },
        history: [
          {
            status: "QUEUED",
            timestamp: "2022-11-23T22:14:15.206Z",
            multisigTransaction: {
              type: "SAFE",
              nonce: 37,
              address: "0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31",
              safeTxHash: "0x15f42ca7a6911d9054c7d35bce474538a0dce0c43e12694f927ce76889974e90",
              transactionId:
                "multisig_0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31_0x15f42ca7a6911d9054c7d35bce474538a0dce0c43e12694f927ce76889974e90",
            },
          },
        ],
      },
    },
  })) as ProposalPayment

  expect(payment?.data?.history.length).toBe(1)
  expect(payment?.data?.history[0]?.status).toBe("QUEUED")
  expect(payment?.data?.history[0]?.transactionHash).toBeUndefined()

  await saveTransactionHashToPayments({
    milestoneId: milestone.id,
    proposalId: proposal.id,
    paymentId: payment.id,
    transactionHash: "HASH",
  })

  const updatedPayment = (await db.proposalPayment.findUnique({
    where: { id: payment.id },
  })) as ProposalPayment

  expect(updatedPayment?.data?.history.length).toBe(1)
  expect(updatedPayment?.data?.history[0]?.status).toBe("SUCCESS")
  expect(updatedPayment?.data?.history[0]?.transactionHash).toBe("HASH")
})

/**
 * Case: gnosis safe, 1st transaction rejected, 2nd queued and approved.
 */
test("Save transaction to payment with one rejected transaction and one queued", async () => {
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
      data: { title: "Upfront payment" },
    },
  })

  const payment = (await db.proposalPayment.create({
    data: {
      proposalId: proposal.id,
      milestoneId: milestone.id,
      senderAddress: "",
      recipientAddress: "",
      amount: 0.001,
      data: {
        token: {
          name: "Goerli ETH",
          type: "COIN",
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
          chainId: 5,
          decimals: 18,
        },
        history: [
          {
            status: "REJECTED",
            timestamp: "2022-11-23T22:14:15.206Z",
            transactionHash: "REJECTED_HASH",
            multisigTransaction: {
              type: "SAFE",
              nonce: 37,
              address: "0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31",
              safeTxHash: "0x15f42ca7a6911d9054c7d35bce474538a0dce0c43e12694f927ce76889974e90",
              transactionId:
                "multisig_0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31_0x15f42ca7a6911d9054c7d35bce474538a0dce0c43e12694f927ce76889974e90",
            },
          },
          {
            status: "QUEUED",
            timestamp: "2022-11-24T22:14:15.206Z",
            multisigTransaction: {
              type: "SAFE",
              nonce: 37,
              address: "0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31",
              safeTxHash: "0x15f42ca7a6911d9054c7d35bce474538a0dce0c43e12694f927ce76889974e91",
              transactionId:
                "multisig_0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31_0x15f42ca7a6911d9054c7d35bce474538a0dce0c43e12694f927ce76889974e90",
            },
          },
        ],
      },
    },
  })) as ProposalPayment

  expect(payment?.data?.history.length).toBe(2)
  expect(payment?.data?.history[0]?.status).toBe("REJECTED")
  expect(payment?.data?.history[1]?.status).toBe("QUEUED")

  await saveTransactionHashToPayments({
    milestoneId: milestone.id,
    proposalId: proposal.id,
    paymentId: payment.id,
    transactionHash: "HASH",
  })

  const updatedPayment = (await db.proposalPayment.findUnique({
    where: { id: payment.id },
  })) as ProposalPayment

  expect(updatedPayment?.data?.history.length).toBe(2)
  expect(updatedPayment?.data?.history[0]?.status).toBe("REJECTED")
  expect(updatedPayment?.data?.history[1]?.status).toBe("SUCCESS")
})

/**
 * Case: gnosis safe, 1st tx rejected, 2nd transaction to be attached, none currently pending
 */
test("Save transaction to payment with one rejected transaction", async () => {
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
      data: { title: "Upfront payment" },
    },
  })

  const payment = (await db.proposalPayment.create({
    data: {
      proposalId: proposal.id,
      milestoneId: milestone.id,
      senderAddress: "",
      recipientAddress: "",
      amount: 0.001,
      data: {
        token: {
          name: "Goerli ETH",
          type: "COIN",
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
          chainId: 5,
          decimals: 18,
        },
        history: [
          {
            status: "REJECTED",
            timestamp: "2022-11-23T22:14:15.206Z",
            transactionHash: "0xf94d3b8d7a2e625908ef5aa9aeca775b743271787f77c8489c1b0db2023f40ba",
            multisigTransaction: {
              type: "SAFE",
              nonce: 37,
              address: "0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31",
              safeTxHash: "0x15f42ca7a6911d9054c7d35bce474538a0dce0c43e12694f927ce76889974e90",
              transactionId:
                "multisig_0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31_0x15f42ca7a6911d9054c7d35bce474538a0dce0c43e12694f927ce76889974e90",
            },
          },
        ],
      },
    },
  })) as ProposalPayment

  expect(payment?.data?.history.length).toBe(1)
  expect(payment?.data?.history[0]?.status).toBe("REJECTED")

  await saveTransactionHashToPayments({
    milestoneId: milestone.id,
    proposalId: proposal.id,
    paymentId: payment.id,
    transactionHash: "HASH",
  })

  const updatedPayment = (await db.proposalPayment.findUnique({
    where: { id: payment.id },
  })) as ProposalPayment

  expect(updatedPayment?.data?.history.length).toBe(2)
  expect(updatedPayment?.data?.history[0]?.status).toBe("REJECTED")
  expect(updatedPayment?.data?.history[1]?.status).toBe("SUCCESS")
})

// need to export empty to satisfy typescript
export {}
