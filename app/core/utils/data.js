// need wallet address to mint nft
// nft number will call the respective smart contract
export const users = {
  rie: {
    fname: "rie",
    handle: "123243534234234",
    role: "visitor",
    address: "",
    pronouns: "she/her",
    skills: ["frontend"],
    terminals: ["station"],
    initiatives: ["web"],
    nftId: 10,
  },
  mindapi: {
    fname: "mindapi",
    handle: "mindapi",
    role: "staff",
    address: "",
    pronouns: "she/her",
    skills: ["design", "product"],
    terminals: ["station", "poolsuite"],
    initiatives: ["brand", "web"],
    nftId: 2,
  },
  fakepixels: {
    fname: "fakepixels",
    handle: "fakepixels",
    role: "staff",
    address: "",
    pronouns: "she/her",
    skills: ["entrepreneurship", "investing", "design"],
    terminals: ["station", "juicebox", "seedclub"],
    initiatives: ["newstand", "terminal partnership"],
    nftId: 1,
  },
}

export const terminals = {
  station: {
    terminalName: "Station",
    handle: "station",
    staff: ["mindapi", "fakepixels"],
    commuter: ["rie"],
    visitor: [],
    initiatives: ["protocol", "brand", "web", "terminal partnership"],
  },
  poolsuite: {
    terminalName: "Poolsuite",
    handle: "poolsuite",
    staff: [],
    commuter: [],
    visitor: ["mindapi"],
    initiatives: ["protocol", "brand", "web", "terminal partnership"],
  },
  juicebox: {
    terminalName: "Juicebox",
    handle: "juicebox",
    staff: [],
    commuter: ["fakepixels"],
    visitor: [],
    initiatives: ["protocol", "brand", "web", "terminal partnership"],
  },
  seedclub: {
    terminalName: "Seedclub",
    handle: "seedclub",
    staff: ["fakepixels"],
    commuter: [],
    visitor: ["fakepixels"],
    initiatives: ["protocol", "brand", "web", "terminal partnership"],
  },
}
