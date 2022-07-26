import { keccak256, toUtf8Bytes } from "ethers/lib/utils"

export const genRfpSignatureMessage = (values, author) => {
  const now = new Date()
  const startDate = new Date(values.startDate)
  const endDate = new Date(values.endDate)

  return {
    domain: {
      name: "Request for Proposals", // keep hardcoded
      version: "1", // keep hardcoded
    },
    types: {
      Proposal: [
        { name: "author", type: "address" },
        { name: "replyTo", type: "address" }, // (checkbook address for now)
        { name: "timestamp", type: "uint256" }, // ISO formatted date string
        { name: "startDate", type: "uint256" }, // ISO formatted date string
        { name: "endDate", type: "uint256" }, // ISO formatted date string
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
      title: keccak256(toUtf8Bytes(values.title)),
      body: keccak256(toUtf8Bytes(values.markdown)),
    },
  }
}
