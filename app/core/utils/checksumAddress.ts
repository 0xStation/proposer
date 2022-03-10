const createKeccakHash = require("keccak")

export const toChecksumAddress = (address) => {
  address = address.toLowerCase().replace("0x", "")
  var hash = createKeccakHash("keccak256").update(address).digest("hex")
  var ret = "0x"

  for (var i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase()
    } else {
      ret += address[i]
    }
  }

  return ret
}
