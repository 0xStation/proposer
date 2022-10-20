import { Account } from "app/account/types"
import { ProposalTemplate as PrismaProposalTemplate } from "@prisma/client"

export type ProposalTemplate = PrismaProposalTemplate & {
  account?: Account
  data: ProposalTemplateMetadata
}

export type ProposalTemplateMetadata = {
  title: string
  fields: Template
}

export type Template = {
  key: string
  mapsTo: string
  value: any
  fieldType: TemplateFieldType
}[]

export enum TemplateFieldType {
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
