import { Token } from "app/token/types"
import { getFieldDef } from "graphql/execution/execute"
import { RESERVED_KEYS, Template } from "./types"

export const getFieldValue = (template: Template | undefined, key: RESERVED_KEYS) => {
  return template ? template.find((field) => field.key === key)?.value : null
}

export const getClientAddress = (template: Template | undefined): string => {
  const fieldVal = getFieldValue(template, RESERVED_KEYS.CLIENTS)
  return getFieldValue(template, RESERVED_KEYS.CLIENTS)?.[0]?.address
}

export const addAddressAsRecipientToPayments = (template: Template, address: string) => {
  const payments = getFieldValue(template, RESERVED_KEYS.PAYMENTS)
  return payments.map((payment) => {
    return {
      ...payment,
      recipientAddress: address,
    }
  })
}

export const getPaymentToken = (template: Template | undefined): Token => {
  return getFieldValue(template, RESERVED_KEYS.PAYMENTS)?.[0]?.token
}

export const getPaymentAmount = (template: Template | undefined): number => {
  return getFieldValue(template, RESERVED_KEYS.PAYMENTS)?.[0]?.amount
}
