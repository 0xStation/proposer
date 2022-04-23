import { StatusOptions } from "app/deprecated/v1/initiative/types"

const InitiativeStatusOptions = [
  { value: StatusOptions.OPEN_FOR_SUBMISSIONS, label: "Open for submissions" },
  { value: StatusOptions.ACTIVE, label: "Active" },
  { value: StatusOptions.INACTIVE, label: "Inactive" },
]

const getInitiativeStatusOptionFromValue = (value) => {
  return InitiativeStatusOptions.find((is) => is.value === value)
}

const getInitiativeStatusColor = (status) => {
  switch (status) {
    case StatusOptions.OPEN_FOR_SUBMISSIONS:
      return `neon-blue`

    case StatusOptions.ACTIVE:
      return `magic-mint`

    case StatusOptions.INACTIVE:
      return "concrete"

    default:
      return "concrete"
  }
}

export { InitiativeStatusOptions, getInitiativeStatusOptionFromValue, getInitiativeStatusColor }
