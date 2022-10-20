import { Account } from "app/account/types"
import { ProposalTemplate as PrismaProposalTemplate } from "@prisma/client"

export type ProposalTemplate = PrismaProposalTemplate & {
  account?: Account
  data: ProposalTemplateMetadata
}

export type ProposalTemplateMetadata = {
  title: string
  fields: ProposalTemplateField
}
export type ProposalTemplateField = {
  key: string
  mapsTo: string
  value: any
  fieldType: ProposalTemplateFieldType
}[]

export enum ProposalTemplateFieldType {
  PRESELECT = "PRESELECT",
  PREFILL = "PREFILL",
  OPEN = "OPEN",
}

export enum RESERVED_KEYS {
  ROLES = "roles",
  CLIENTS = "clients",
  CONTRIBUTORS = "contributors",
  AUTHORS = "authors",
  MILESTONES = "milestones",
  PAYMENTS = "payments",
  PAYMENT_TERMS = "paymentTerms",
}
