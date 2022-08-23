import { toUtf8Bytes } from "@ethersproject/strings"
import { keccak256 } from "@ethersproject/keccak256"

export const genRfpSignatureMessage = (values, author, chainId) => {
  const now = new Date()
  const startDate = new Date(values.startDate)
  const endDate = new Date(values.endDate)

  return {
    domain: {
      name: "Projects", // keep hardcoded
      version: "1", // keep hardcoded
      chainId,
    },
    types: {
      Rfp: [
        { name: "author", type: "address" },
        { name: "replyTo", type: "address" }, // (checkbook address for now)
        { name: "timestamp", type: "uint256" }, // ISO formatted date string
        { name: "startDate", type: "uint256" }, // ISO formatted date string
        { name: "endDate", type: "uint256" }, // ISO formatted date string
        { name: "token", type: "address" },
        { name: "budget", type: "uint256" },
        { name: "title", type: "string" },
        { name: "body", type: "string" },
      ],
    },
    value: {
      author: author,
      replyTo: values.checkbookAddress,
      timestamp: now.valueOf(), // unix timestamp
      startDate: startDate.valueOf(), // unix timestamp
      endDate: values.endDate ? endDate.valueOf() : 0, // unix timestamp
      token: values.fundingTokenAddress,
      budget: values.budgetAmount,
      title: keccak256(toUtf8Bytes(values.title)),
      body: keccak256(toUtf8Bytes(values.markdown)),
    },
  }
}
