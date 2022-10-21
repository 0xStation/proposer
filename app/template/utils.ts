import { Token } from "app/token/types"
import { getFieldDef } from "graphql/execution/execute"
import { RESERVED_KEYS, ProposalTemplateField } from "./types"

export const getField = (template: ProposalTemplateField[] | undefined, key: RESERVED_KEYS) => {
  return template ? template.find((field) => field.key === key) : null
}

export const getFieldValue = (
  template: ProposalTemplateField[] | undefined,
  key: RESERVED_KEYS
) => {
  return template ? template.find((field) => field.key === key)?.value : null
}

export const getClientAddress = (template: ProposalTemplateField[] | undefined): string => {
  return getFieldValue(template, RESERVED_KEYS.CLIENTS)?.[0]?.address
}

export const addAddressAsRecipientToPayments = (
  template: ProposalTemplateField[],
  address: string
) => {
  const payments = getFieldValue(template, RESERVED_KEYS.PAYMENTS)
  return payments.map((payment) => {
    return {
      ...payment,
      recipientAddress: address,
    }
  })
}

export const getPayments = (template: ProposalTemplateField[] | undefined) => {
  return getFieldValue(template, RESERVED_KEYS.PAYMENTS)
}

export const getPaymentToken = (template: ProposalTemplateField[] | undefined): Token => {
  return getPayments(template)?.[0]?.token
}

export const getPaymentAmount = (template: ProposalTemplateField[] | undefined): number => {
  return getPayments(template)?.[0]?.amount
}

export const getMinNumWords = (template: ProposalTemplateField[] | undefined): number => {
  return getField(template, RESERVED_KEYS.BODY)?.validation?.[0]?.args[0] || 0
}
