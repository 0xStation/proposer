import { useContractRead } from "wagmi"
import { TagTokenMetadata } from "app/tag/types"
import { Rfp } from "app/rfp/types"

export const canEdit = (activeUser, terminalId, type) => {
  if (!activeUser) {
    return false
  }

  if (activeUser.data.isAdmin) {
    return true
  }

  const ticket = activeUser.tickets.find((ticket) => ticket.terminalId === terminalId)

  if (!ticket) {
    return false
  }

  const editPerms = ticket.terminal.data.permissions?.edit
  return !!(editPerms ? editPerms[type]?.includes(ticket.roleLocalId as number) : false)
}

const createStationWhitelist = [
  "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  "0x016562aA41A8697720ce0943F003141f5dEAe006",
  "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  "0xd56e3E325133EFEd6B1687C88571b8a91e517ab0",
  "0x32447704A3AC5Ed491B6091497ffB67A7733b624",
  "0x942cBEa64876Ff0b2e23c0712B37Dc0091804e9c",
  "0x733D9Ec734d5Fb181Afb33750cDd71c0eb1B1d62",
  "0x40aD478FD10e1EedD07c8D686e5632ebE98735Fd",
  "0x7800bE67f419F0FDAbeFB6021B02B09FEfea2500",
  "0x36501b214b289832EF282663CD98232A9d24e45a",
  "0x7125A7C2e913D70125900630fA36a342cBCb1338",
  "0x5cB44ac5E8bE722b62e88A98dE79d509A42B950c",
  "0xEB95ff72EAb9e8D8fdb545FE15587AcCF410b42E",
  "0xb7F296FE3B08Da98D224fbb663d3fa25150A8EEA",
  "0x3Aab3396Fede536ACCB3a578CD96617092270536",
  "0xf9232F55858e197012155B4754119D23e94C42E6",
  "0x985902Df104aDf498204e5D874f38b67F514De20",
  "0x8Df46D8Bb10D79f89E00e0a6859327f7189C45de",
  "0x29668d39c163f64a1c177c272a8e2D9ecc85F0dE",
  "0x5716e900249D6c35afA41343a2394C32C1B4E6cB",
  "0xe3d8E58551d240626D50EE26FAFF2649e1EEE3cb",
  "0x17A059B6B0C8af433032d554B0392995155452E6",
  "0x5090c4Fead5Be112b643BC75d61bF42339675448",
  "0x924C15E11612b0F58968e90F566E52BbA41870A0",
  "0x22B660F6E6A007AceA649AcD028A8d057c15620c",
  "0x68fE87c69848375A846fc666c41aC8d5047a4Dc2",
  "0x52217bAD145A7a80D510f24A9572781D260f33D3", // Radical DAO
  "0xbeC26FFa12c90217943D1b2958f60A821aE6E549", // CabinDAO
  "0x267a3195ea57ad38e65993dbcb9fbebf8995621d", // CityDAO
  "0x4ce2dd8373ece0d7baaa16e559a5817cc875b16a", // Unlock Protocol
  "0x5dc70a9b884f78ee030a8c6ad3b3b7dc10bbe7f4", // Unlock Protocol
  "0xff4ec2057a4180a4cd18fdea144e53245e39869d", // Unlock Protocol
  "0xcd5a7d5c7dc605e42fb4a9e11da38a06a96d1f9a", // Philosophical Foxes
  "0xf6910D47FbB1F5518d60C721D4189936eCd5a1b6", // InfoToken
  "0x285b7eea81a5b66b62e7276a24c1e0f83f7409c1", // 0xmaki
  "0x84c30aeca40bcf38e17E52A85f0D383E373E5D55", // Osmosis Grants
  "0x16921fd2c4221a8c2f4d729cbd65a0c4a80be940", // not fellows
  "0x2D888de2a429Cb43359a8420722e79491F07DC73", // Fiat DAO
  "0xf0fbaaa7ece80ac41508e442929b81a4c8c8543b", // ready player DAO
  "0xc7814D61A8236303a8854fc272cA0419A7e18E32", // ceramic
  "0x75d2e010392c99e1dab54781bFe4760a091A2c51", // flashbots
  "0x586Bc43937C2eC42348cc83Acf44CED42Fe3d5f7", // fingerprintsDAO
  "0xb4248430C7AF4Ce104b25C1677cE4FB32884210f", // squiggleDAO
  "0x93730CE5Ac9de1DB9F3FBb73bF522a690629CCEc", // Tribute Labs
  "0xa2bf1b0a7e079767b4701b5a1d9d5700eb42d1d1", // Uniswap Foundation
  "0xeBf8c12A6Ebc94143baf2c8506CFCBD2BE7B5D33", // TempuraDAO
  "0xeBf8c12A6Ebc94143baf2c8506CFCBD2BE7B5D33", // TempuraDAO
  "0xF177FaecA47F3F301581b6F94BeA46Be32cd8344", // TempuraDAO
  "0xbc1796b4d9d112de8cf29849ee3e732ffd27d4d8", // Livepeer
]
export const canCreateStation = (address: string | undefined) => {
  if (process.env.NODE_ENV !== "production") return true
  if (!address) return false
  const lowercaseAddress = address.toLowerCase()
  return createStationWhitelist.some((address) => address.toLowerCase() === lowercaseAddress)
}

export const useUserCanSubmitToRfp = (walletAddress: string | undefined, rfp: Rfp) => {
  const hasNoSubmitPermissionSet = rfp?.data && !rfp.data?.permissions?.submit

  const canSubmit = useAddressHasToken(
    walletAddress,
    rfp?.data?.permissions && rfp?.data?.permissions.submit
  )

  // if the user has no submit permission set it means the object {data: {permissions: { }}} is empty for submit
  // this means the RFP has not set any submit permissions, and should default to public
  // we want to return true no matter the result of canSubmit
  // --
  // We are doing an "empty call" to the canSubmit function above
  // It is a hook, so we cannot call this first and do an early return if true
  // If we did, react would consider it a conditional in front of a hook, which is not allowed.
  // Instead, we ALWAYS run the useAddressHasToken function, but we throw out the value if its not set
  // Otherwise, useAddressHasToken will be false for empty value because user cannot have empty token
  // or not signed in user cannot have a token (either of the undefined cases)
  if (hasNoSubmitPermissionSet) {
    return true
  }

  return canSubmit
}

export const useUserCanViewRfp = (walletAddress: string | undefined, rfp: Rfp) => {
  const hasNoViewPermissionSet = rfp?.data && !rfp.data?.permissions?.view

  const canView = useAddressHasToken(
    walletAddress,
    rfp?.data?.permissions && rfp?.data?.permissions.view
  )

  // see useUserCanSubmitToRfp above for details
  if (hasNoViewPermissionSet) {
    return true
  }

  return canView
}

const balanceOfAbi = ["function balanceOf(address _owner) public view returns (uint256 balance)"]

// returns true if the given address has a positive balance of the token at the given contract address
export const useAddressHasToken = (
  walletAddress: string | undefined,
  tokenTag: TagTokenMetadata | undefined
) => {
  const { data } = useContractRead({
    addressOrName: tokenTag?.address || "",
    chainId: tokenTag?.chainId,
    contractInterface: balanceOfAbi,
    functionName: "balanceOf",
    args: [walletAddress],
    enabled: !!tokenTag,
  })

  if (data) {
    return data.gt(0)
  }

  return false
}
