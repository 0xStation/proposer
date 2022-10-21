import { Account } from "app/account/types"
import { ProposalTemplate as PrismaProposalTemplate } from "@prisma/client"

export type ProposalTemplate = PrismaProposalTemplate & {
  account?: Account
  data: ProposalTemplateMetadata
}

export type ProposalTemplateMetadata = {
  title: string
  fields: ProposalTemplateField[]
}
export type ProposalTemplateField = {
  key: string
  mapsTo: string
  fieldType: ProposalTemplateFieldType
  value?: any
  validation?: ProposalTemplateFieldValidation[]
}

export type ProposalTemplateFieldValidation = {
  name: ProposalTemplateFieldValidationName
  args: any[]
}

export enum ProposalTemplateFieldValidationName {
  MIN_WORDS = "mustBeAboveNumWords",
}

export enum ProposalTemplateFieldType {
  PRESELECT = "PRESELECT",
  PREFILL = "PREFILL",
  OPEN = "OPEN",
}

export enum RESERVED_KEYS {
  ROLES = "roles",
  CLIENTS = "clients",
  CONTRIBUTORS = "contributors",
  BODY = "body",
  AUTHORS = "authors",
  MILESTONES = "milestones",
  PAYMENTS = "payments",
  PAYMENT_TERMS = "paymentTerms",
}
