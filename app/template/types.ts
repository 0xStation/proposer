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
