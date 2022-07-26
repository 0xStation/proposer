import { keccak256, toUtf8Bytes } from "ethers/lib/utils"
import { BigNumber } from "ethers"

export const genProposalSignatureMessage = (
  proposalRecipient: string,
  author: string,
  rfpId: string,
  parsedTokenAmount: BigNumber,
  formValues: any
) => {
  const now = new Date()

  return {
    domain: {
      name: "Proposal", // keep hardcoded
      version: "1", // keep hardcoded
    },
    types: {
      Funding: [
        { name: "type", type: "string" }, // hard coded to single-upon-approval
        { name: "fundingRecipient", type: "address" }, // recieves the reward from the proposal
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      Proposal: [
        { name: "proposalRecipient", type: "address" }, // (checkbook address for now) reciever of the proposal
        { name: "author", type: "address" },
        { name: "collaborators", type: "address[]" },
        { name: "timestamp", type: "uint256" }, // hash of ISO formatted date string
        { name: "funding", type: "Funding" },
        { name: "rfp", type: "string" }, // hashed uuid since uuid is not at type?
        { name: "title", type: "string" },
        { name: "body", type: "string" },
      ],
    },
    value: {
      proposalRecipient,
      author,
      collaborators: [author],
      timestamp: now.valueOf(), // unix timestamp
      rfp: keccak256(toUtf8Bytes(rfpId)),
      title: keccak256(toUtf8Bytes(formValues.title)),
      body: keccak256(toUtf8Bytes(formValues.markdown)),
      funding: {
        type: "single-upon-approval",
        fundingRecipient: formValues.recipientAddress,
        token: formValues.token,
        amount: parsedTokenAmount,
      },
    },
  }
}
