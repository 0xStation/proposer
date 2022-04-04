export const OPEN_FOR_SUBMISSIONS = "Open to submissions"
export const ACTIVE = "Active"
export const INACTIVE = "Inactive"

const InitiativeStatusOptions = [
  { value: OPEN_FOR_SUBMISSIONS, label: OPEN_FOR_SUBMISSIONS },
  { value: ACTIVE, label: ACTIVE },
  { value: INACTIVE, label: INACTIVE },
]

const getInitiativeStatusOptionFromValue = (value) => {
  return InitiativeStatusOptions.find((is) => is.value === value)
}

const getInitiativeStatusColor = (status) => {
  switch (status) {
    case OPEN_FOR_SUBMISSIONS:
      return `neon-blue`

    case ACTIVE:
      return `magic-mint`

    case INACTIVE:
      return "concrete"

    default:
      return "concrete"
  }
}

export { InitiativeStatusOptions, getInitiativeStatusOptionFromValue, getInitiativeStatusColor }
