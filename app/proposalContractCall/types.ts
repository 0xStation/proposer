import { ProposalTransaction as PrismaProposalTransaction } from "@prisma/client"
import { FunctionFragment } from "@ethersproject/abi"

export type ProposalTransaction = PrismaProposalTransaction & {
  data: ProposalTransactionMetadata
}

export type ProposalTransactionMetadata = {
  title: string
  humanReadableAbi: string // raw input from form's "Function specification and arguments"
  fragment: FunctionFragment // from ethers: https://docs.ethers.io/v5/api/utils/abi/fragments/#FunctionFragment
  values: any[] // order matters, aligns perfectly with fragment.inputs: https://docs.ethers.io/v5/api/utils/abi/fragments/#Fragment
}
