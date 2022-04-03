import isURL from "validator/lib/isURL"

export const composeValidators =
  (...validators) =>
  (value) =>
    validators.reduce((error, validator) => error || validator(value), undefined)

export const required = (value) => (value ? undefined : "This field is required.")
export const mustBeUrl = (value) => {
  if (!value) {
    return undefined
  }
  let options = {
    protocols: ["http", "https", "ftp"],
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
  console.log(valid)
  return valid ? undefined : "Not a valid url. Could you be missing www. or https://?"
}
