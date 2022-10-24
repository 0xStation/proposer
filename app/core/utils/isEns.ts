import { validEnsDomains } from "../utils/constants"

export const isEns = (text: string): boolean => {
  const domain = text?.split(".").slice(-1)[0] // grab last substring after period
  const isEns = Boolean(domain && validEnsDomains.includes(domain))
  return isEns
}
