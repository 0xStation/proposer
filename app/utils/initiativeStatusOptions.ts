const InitiativeStatusOptions = [
  { value: "Open to submissions", label: "Open to submissions" },
  { value: "Closed to submissions", label: "Closed to submissions" },
  { value: "inactive", label: "Inactive" },
]

const getInitiativeStatusOptionFromValue = (value) => {
  return InitiativeStatusOptions.find((is) => is.value === value)
}

export { InitiativeStatusOptions, getInitiativeStatusOptionFromValue }
