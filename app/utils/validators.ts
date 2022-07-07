import { utils } from "ethers"
import isURL from "validator/lib/isURL"

// reducer that takes in an array of validators (functions) and returns the appropriate error
// useful if you have a form field that has a few different validations (required field, must be number, etc)
// example use case would look like
// <Field name="name" validate={composeValidators(required, mustBeUrl)}>
export const composeValidators =
  (...validators) =>
  (value) =>
    validators.reduce((error, validator) => error || validator(value), undefined)

export const requiredField = (value) => (value ? undefined : "This field is required.")

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
  return utils.isAddress(address) ? undefined : "Not a valid address"
}
