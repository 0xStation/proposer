import api from "./parse-gnosis-tx"
import { createMocks } from "node-mocks-http"
import db from "db"
import { BigNumber } from "ethers"
import { ProposalPayment } from "app/proposalPayment/types"

const VALID_SAFE_TX_HASH = "0x7cc11d27d62e1818fc3ff81abbc7bb620e84dcf125c222feb4ec76108d53252d"
const INVALID_SAFE_TX_HASH = "0x7cc11d27d62e1818fc3ff81abbc7bb620e84dcf125c222feb4ec7610xxxxxxxx"

jest.mock("app/utils/rpcMulticall", () => ({
  multicall: () => [{ nonce: BigNumber.from("4") }],
}))

jest.mock("app/core/utils/constants", () => ({
  GNOSIS_EXECUTION_SUCCESS_EVENT_HASH:
    "0x442e715f626346e8c54381002da614f62bee8d27386535b2521ec8540898556e",
}))

jest.mock("app/utils/email", () => ({
  sendProposalApprovedEmail: () => {},
}))

jest.mock("app/utils/privy", () => ({
  getEmails: () => {},
}))

jest.mock("app/proposal/mutations/pinProposal", () => {})

afterAll(async () => {
  const deleteAccounts = db.account.deleteMany()
  await db.$transaction([deleteAccounts])
  await db.$disconnect()
})

test("Moralis webhook -- successful execution", async () => {
  // setup account with moralis stream-id
  await db.account.create({
    data: {
      address: "0xd0e09d3d8c82a8b92e3b1284c5652da2ed9aec31",
      moralisStreamId: "0926dab2-4c25-4981-b628-41e8299520ba",
      addressType: "SAFE",
      data: {},
    },
  })

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

  const payment = (await db.proposalPayment.create({
    data: {
      milestoneId: milestone.id,
      proposalId: proposal.id,
      senderAddress: "0xd0e09d3d8c82a8b92e3b1284c5652da2ed9aec31",
      recipientAddress: "0x",
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
            timestamp: "2022-11-24T00:38:39.005Z",
            transactionHash: "0x6a161d04c50f9788bd7a1dc32eacf2cc6c5f32c93b7e6b69a97984702e953e60",
            multisigTransaction: {
              type: "SAFE",
              nonce: 3,
              address: "0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31",
              safeTxHash: VALID_SAFE_TX_HASH,
              transactionId:
                "multisig_0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31_0x7cc11d27d62e1818fc3ff81abbc7bb620e84dcf125c222feb4ec76108d53252d",
            },
          },
        ],
      },
    },
  })) as ProposalPayment

  const { req, res } = createMocks({
    method: "POST",
    body: {
      confirmed: false,
      chainId: "0x5",
      streamId: "0926dab2-4c25-4981-b628-41e8299520ba",
      logs: [
        {
          transactionHash: "0xc7853c0d74a72a26d428033ba8969b0a253608f4ebaec575d30e4f3641be766e",
          address: "0xd0e09d3d8c82a8b92e3b1284c5652da2ed9aec31",
          data: `${VALID_SAFE_TX_HASH}0000000000000000000000000000000000000000000000000000000000000000`,
          topic0: "0x442e715f626346e8c54381002da614f62bee8d27386535b2521ec8540898556e",
        },
      ],
    },
  })

  expect(payment?.data.history[0]?.status).toBe("QUEUED")

  await api(req as any, res as any)

  const updatedPayment = (await db.proposalPayment.findUnique({
    where: { id: payment.id },
  })) as ProposalPayment

  expect(updatedPayment?.data.history[0]?.status).toBe("SUCCESS")
})

test("Moralis webhook -- rejected execution", async () => {
  // account with moralis stream already exists

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

  const payment = (await db.proposalPayment.create({
    data: {
      milestoneId: milestone.id,
      proposalId: proposal.id,
      senderAddress: "0xd0e09d3d8c82a8b92e3b1284c5652da2ed9aec31",
      recipientAddress: "0x",
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
            timestamp: "2022-11-24T00:38:39.005Z",
            transactionHash: "0x6a161d04c50f9788bd7a1dc32eacf2cc6c5f32c93b7e6b69a97984702e953e60",
            multisigTransaction: {
              type: "SAFE",
              nonce: 3,
              address: "0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31",
              safeTxHash: VALID_SAFE_TX_HASH,
              transactionId:
                "multisig_0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31_0x7cc11d27d62e1818fc3ff81abbc7bb620e84dcf125c222feb4ec76108d53252d",
            },
          },
        ],
      },
    },
  })) as ProposalPayment

  const { req, res } = createMocks({
    method: "POST",
    body: {
      confirmed: false,
      chainId: "0x5",
      streamId: "0926dab2-4c25-4981-b628-41e8299520ba",
      logs: [
        {
          transactionHash: "0xc7853c0d74a72a26d428033ba8969b0a253608f4ebaec575d30e4f3641be766e",
          address: "0xd0e09d3d8c82a8b92e3b1284c5652da2ed9aec31",
          data: `${INVALID_SAFE_TX_HASH}0000000000000000000000000000000000000000000000000000000000000000`,
          topic0: "0x442e715f626346e8c54381002da614f62bee8d27386535b2521ec8540898556e",
        },
      ],
    },
  })

  expect(payment?.data.history[0]?.status).toBe("QUEUED")

  await api(req as any, res as any)

  const updatedPayment = (await db.proposalPayment.findUnique({
    where: { id: payment.id },
  })) as ProposalPayment

  expect(updatedPayment?.data.history[0]?.status).toBe("REJECTED")
})

// the webhook responds to all txs from the gnosis contract which could possibly include non-station txs.
// we want to make sure nothing is shaking up if we execute a tx that was not queued via station.
test("Moralis webhook -- non station tx", async () => {
  // account with moralis stream already exists

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

  const payment = (await db.proposalPayment.create({
    data: {
      milestoneId: milestone.id,
      proposalId: proposal.id,
      senderAddress: "0xd0e09d3d8c82a8b92e3b1284c5652da2ed9aec31",
      recipientAddress: "0x",
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
            status: "APPROVED",
            timestamp: "2022-11-24T00:38:39.005Z",
            transactionHash: "0x6a161d04c50f9788bd7a1dc32eacf2cc6c5f32c93b7e6b69a97984702e953e60",
            multisigTransaction: {
              type: "SAFE",
              nonce: 3,
              address: "0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31",
              safeTxHash: VALID_SAFE_TX_HASH,
              transactionId:
                "multisig_0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31_0x7cc11d27d62e1818fc3ff81abbc7bb620e84dcf125c222feb4ec76108d53252d",
            },
          },
        ],
      },
    },
  })) as ProposalPayment

  const { req, res } = createMocks({
    method: "POST",
    body: {
      confirmed: false,
      chainId: "0x5",
      streamId: "0926dab2-4c25-4981-b628-41e8299520ba",
      logs: [
        {
          transactionHash: "0xc7853c0d74a72a26d428033ba8969b0a253608f4ebaec575d30e4f3641be766e",
          address: "0xd0e09d3d8c82a8b92e3b1284c5652da2ed9aec31",
          data: `${INVALID_SAFE_TX_HASH}0000000000000000000000000000000000000000000000000000000000000000`,
          topic0: "0x442e715f626346e8c54381002da614f62bee8d27386535b2521ec8540898556e",
        },
      ],
    },
  })

  // tx was already approved, this next webhook is bogus
  expect(payment?.data.history[0]?.status).toBe("APPROVED")

  await api(req as any, res as any)

  const updatedPayment = (await db.proposalPayment.findUnique({
    where: { id: payment.id },
  })) as ProposalPayment

  // does not change status
  expect(updatedPayment?.data.history[0]?.status).toBe("APPROVED")
  // does not add new history
  expect(updatedPayment?.data.history.length).toBe(1)
})

// could happen if there is a bug in moralis or if many streams are set up for the same account
// of course, many streams should not get set up, but it is a possible error case we should protect against
test("Moralis webhook -- called twice", async () => {
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

  const payment = (await db.proposalPayment.create({
    data: {
      milestoneId: milestone.id,
      proposalId: proposal.id,
      senderAddress: "0xd0e09d3d8c82a8b92e3b1284c5652da2ed9aec31",
      recipientAddress: "0x",
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
            timestamp: "2022-11-24T00:38:39.005Z",
            transactionHash: "0x6a161d04c50f9788bd7a1dc32eacf2cc6c5f32c93b7e6b69a97984702e953e60",
            multisigTransaction: {
              type: "SAFE",
              nonce: 3,
              address: "0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31",
              safeTxHash: VALID_SAFE_TX_HASH,
              transactionId:
                "multisig_0xd0e09D3D8C82A8B92e3B1284C5652Da2ED9aEc31_0x7cc11d27d62e1818fc3ff81abbc7bb620e84dcf125c222feb4ec76108d53252d",
            },
          },
        ],
      },
    },
  })) as ProposalPayment

  const { req, res } = createMocks({
    method: "POST",
    body: {
      confirmed: false,
      chainId: "0x5",
      streamId: "0926dab2-4c25-4981-b628-41e8299520ba",
      logs: [
        {
          transactionHash: "0xc7853c0d74a72a26d428033ba8969b0a253608f4ebaec575d30e4f3641be766e",
          address: "0xd0e09d3d8c82a8b92e3b1284c5652da2ed9aec31",
          data: `${INVALID_SAFE_TX_HASH}0000000000000000000000000000000000000000000000000000000000000000`,
          topic0: "0x442e715f626346e8c54381002da614f62bee8d27386535b2521ec8540898556e",
        },
      ],
    },
  })

  expect(payment?.data.history[0]?.status).toBe("QUEUED")

  await api(req as any, res as any)
  await api(req as any, res as any)

  const updatedPayment = (await db.proposalPayment.findUnique({
    where: { id: payment.id },
  })) as ProposalPayment

  // calling twice should not create a new history record
  expect(updatedPayment?.data.history.length).toBe(1)
  // invalid-tx-hash = queued -> rejected
  expect(updatedPayment?.data.history[0]?.status).toBe("REJECTED")
})

export {}
