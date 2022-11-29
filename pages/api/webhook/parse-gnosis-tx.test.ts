import api from "./parse-gnosis-tx"
import { createMocks } from "node-mocks-http"
import db from "db"
import { BigNumber } from "ethers"
import { ProposalPayment } from "app/proposalPayment/types"

jest.mock("app/utils/rpcMulticall", () => ({
  multicall: () => [{ nonce: BigNumber.from("4") }],
}))

jest.mock("app/core/utils/constants", () => ({
  GNOSIS_EXECUTION_SUCCESS_EVENT_HASH:
    "0x442e715f626346e8c54381002da614f62bee8d27386535b2521ec8540898556e",
}))

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
              safeTxHash: "0x7cc11d27d62e1818fc3ff81abbc7bb620e84dcf125c222feb4ec76108d53252d",
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
          data: "0x7cc11d27d62e1818fc3ff81abbc7bb620e84dcf125c222feb4ec76108d53252d0000000000000000000000000000000000000000000000000000000000000000",
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

export {}
