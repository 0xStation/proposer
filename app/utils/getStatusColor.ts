import { ApplicationStatus } from "app/application/types"

const getStatusColor = (status: ApplicationStatus) => {
  switch (status) {
    case "APPLIED":
      return "bg-torch-red"

    case "INVITED":
      return "bg-neon-blue"

    case "CONTRIBUTOR":
      return "bg-magic-mint"

    default:
      return "bg-concrete"
  }
}

export default getStatusColor
