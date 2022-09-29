export const tokenModule = {
  Token: [
    { name: "chainId", type: "uint256" },
    { name: "address", type: "address" },
    { name: "type", type: "string" },
    { name: "name", type: "string" }, // optional, ERC1155 does not support
    { name: "symbol", type: "string" }, // optional, ERC1155 does not support
    { name: "decimals", type: "uint8" }, // optional, ERC721 and ERC1155 do not support
  ],
}
