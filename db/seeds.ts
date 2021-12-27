import db from "./index"

const contributors = [
  {
    address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
    name: "michael",
    handle: "0xmcg",
    pronouns: "he/him",
    bio: "working for station",
  },
  {
    address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
    name: "mind",
    handle: "mindapi",
    pronouns: "she/her",
    bio: "working for station",
  },
  {
    name: "tina",
    handle: "fakepixels",
    address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
    pronouns: "she/her",
    bio: "working for station",
  },
  {
    name: "brendan",
    handle: "brendo",
    address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
    pronouns: "he/him",
    bio: "working for station",
  },
  {
    name: "darian",
    handle: "WGMIApe",
    address: "0x6Cf61c97674C65c68D1E816eCCf36061aCD9a65c",
    pronouns: "he/him",
    bio: "working for station",
  },
  {
    name: "calvin",
    handle: "cchengasaurus",
    address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
    pronouns: "he/him",
    bio: "working for station",
  },
  {
    name: "kristen",
    handle: "rie",
    address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
    pronouns: "she/her",
    bio: "working for station",
  },
  {
    name: "conner",
    handle: "symmtry",
    address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
    pronouns: "he/him",
    bio: "working for station",
  },
  {
    name: "kash",
    handle: "honeykashmoney",
    address: "0x5716e900249D6c35afA41343a2394C32C1B4E6cB",
    pronouns: "he/him",
    bio: "working for station",
  },
  {
    name: "akshay",
    handle: "wagmiking",
    address: "0x8FAA5498Ca6fc9A61BA967E07fBc9420aab99E55",
    pronouns: "he/him",
    bio: "working for station",
  },
]

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  // creating the station terminal
  let terminal = await db.terminal.create({
    data: {
      name: "Station",
      handle: "station",
      description: "Building the infrastructure to empower the next billion contributors in web3.",
      subgraphId: "",
      ticketContract: "0xd9243de6be84EA0f592D20e3E6bd67949D96bfe9",
    },
  })

  // creating all of the station contributors
  for (let i = 0; i < contributors.length; i++) {
    let contributorData = contributors[i]
    if (contributorData) {
      await db.account.create({
        data: contributorData,
      })
    }
  }

  // creating the intial initiatives
  await db.initiative.create({
    data: {
      name: "Web v1",
      description: "working on the product of station.",
      shortName: "WEB",
      terminal: {
        connect: { id: terminal.id },
      },
    },
  })
  await db.initiative.create({
    data: {
      name: "Newstand",
      description:
        "Station Network’s publication focused on exploring the possibilities of work in an era of hyper connectivity and fluidity. ",
      shortName: "NEWSTAND",
      terminal: {
        connect: { id: terminal.id },
      },
    },
  })
}

export default seed
