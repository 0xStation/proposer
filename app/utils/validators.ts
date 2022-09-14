import { isAddress as ethersIsAddress } from "@ethersproject/address"
import isURL from "validator/lib/isURL"
import isEmail from "validator/lib/isEmail"
import { formatTokenAmount } from "./formatters"
import { getNetworkExplorer } from "app/core/utils/networkInfo"
import { txPathString } from "app/core/utils/constants"

// reducer that takes in an array of validators (functions) and returns the appropriate error
// useful if you have a form field that has a few different validations (required field, must be number, etc)
// example use case would look like
// <Field name="name" validate={composeValidators(required, mustBeUrl)}>
export const composeValidators =
  (...validators) =>
  (value) =>
    validators.reduce((error, validator) => error || validator(value), undefined)

export const requiredField = (value) => (value ? undefined : "Required field")

export const mustBeUnderNumCharacters =
  (maxNumCharacters = 50) =>
  (value) =>
    value
      ? value.length <= maxNumCharacters
        ? undefined
        : `Must be less than ${maxNumCharacters} characters`
      : undefined

export const mustBeUrl = (value) => {
  if (!value) {
    return undefined
  }
  let options = {
    protocols: ["https"],
    require_tld: true,
    require_protocol: true,
    require_host: true,
    require_valid_protocol: true,
    allow_underscores: false,
    host_whitelist: false,
    host_blacklist: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
    disallow_auth: false,
  }

  const valid = isURL(value, options)
  return valid ? undefined : "Not a valid url. Example format: https://www.twitter.com"
}

export const isValidQuorum = (numSigners: number) => {
  return (quorum: number) => {
    return quorum == 0 // intentional == because form gives quorum as string
      ? "Cannot have zero quorum"
      : quorum > numSigners
      ? "Not enough signers"
      : undefined
  }
}

export const uniqueName = (names: string[]) => {
  return (v: string) => {
    return names.map((n) => n.toLowerCase()).indexOf(v?.toLowerCase()) > -1
      ? "Name already exists"
      : undefined
  }
}

export const isAddress = (address: string) => {
  if (!address) return undefined
  return ethersIsAddress(address) ? undefined : "Not a valid address."
}

export const isValidEmail = (email: string) => {
  if (!email) return undefined // prevent empty strings from triggering validator for optional form inputs
  return isEmail(email) ? undefined : "Invalid email"
}

export const isPositiveAmount = (amount: string) => {
  if (!amount) return undefined
  if (parseFloat(amount) > 0) return undefined // want to allow 0 amount proposals?
  return "Amount must be greater than zero."
}

export const isValidTokenAmount = (decimals: number) => {
  return (preFormatAmount: string) => {
    if (!preFormatAmount) return undefined
    const amount = formatTokenAmount(preFormatAmount)

    if ((amount.split(".")[1]?.length || 0) > decimals)
      return `Cannot have more than ${decimals} decimal places.`

    if (parseFloat(amount) * 10 ** decimals > 2 ** 256 - 1) return "Number exceeds max size"

    return undefined
  }
}

export const isAfterStartDate = (_endDate, values) => {
  if (!values.startDate || !values.endDate) return undefined
  const start = new Date(values.startDate)
  const end = new Date(values.endDate)
  return start < end ? undefined : "End date cannot come before start date."
}

export const maximumDecimals = (decimals: number) => {
  return (value: string) => {
    const [int, fraction] = value.split(".")
    if (!fraction) {
      return undefined
    }
    if (fraction?.length > decimals) {
      return `Cannot have more than ${decimals} decimal places.`
    }
    return undefined
  }
}

export const isValidTransactionLink = (chainId: number) => {
  return (link: string) => {
    const explorerUrl = getNetworkExplorer(chainId)
    if (!explorerUrl) return "Chain id has no verified explorer URL"

    if (link.indexOf(explorerUrl) < 0)
      return "Link does not match this chain's block explorer: " + explorerUrl

    if (link.indexOf(explorerUrl + txPathString) < 0)
      return `Link does not format to: ${explorerUrl + txPathString}`

    const txHash = link.substring(explorerUrl.length + txPathString.length)
    // regex matches for 0x.... with 64 hex characters afterwards (32 bytes)
    const txRegex = /0x[a-fA-F0-9]{64}/
    if (!txRegex.test(txHash)) return "Parsed transacion hash has an invalid format"

    return undefined
  }
}
