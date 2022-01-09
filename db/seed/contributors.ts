import db from "../index"
import { AccountMetadata } from "app/account/types"

const mind: AccountMetadata & { address: string } = {
  name: "Mind",
  handle: "mindapi",
  address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  pronouns: "she/her",
  skills: [],
  discord: "mindapi#",
  verified: true,
  wallet: "mindapi.eth",
  role: "STAFF",
  twitterURL: "https://twitter.com/mindapi_",
}
const tina: AccountMetadata & { address: string } = {
  name: "Tina",
  handle: "fakepixels",
  address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  pronouns: "she/her",
  skills: [],
  discord: "fakepixels#",
  verified: true,
  wallet: "fkpixels.eth",
  role: "STAFF",
  twitterURL: "https://twitter.com/fkpxls",
}
const conner: AccountMetadata & { address: string } = {
  name: "Conner",
  handle: "symmtry",
  address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  pronouns: "he/him",
  skills: [],
  discord: "symmtry#",
  verified: true,
  wallet: "symmtry.eth",
  role: "STAFF",
  twitterURL: "https://twitter.com/symmtry69",
}
const kristen: AccountMetadata & { address: string } = {
  name: "Kristen",
  handle: "rie",
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  pronouns: "she/her",
  skills: [],
  discord: "rie#",
  verified: true,
  wallet: "0x420...6d9",
  role: "STAFF",
  twitterURL: "https://twitter.com/0xRie_",
}
const calvin: AccountMetadata & { address: string } = {
  name: "Calvin",
  handle: "cc2",
  address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  pronouns: "he/him",
  skills: [],
  discord: "cc2#",
  verified: true,
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/cchengasaurus",
}
const brendan: AccountMetadata & { address: string } = {
  name: "Brendan",
  handle: "brendo",
  address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
  pronouns: "he/him",
  skills: [],
  discord: "brendo#",
  verified: true,
  wallet: "brendo.eth",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/brendanelliot",
}
const michael: AccountMetadata & { address: string } = {
  name: "Michael",
  handle: "frog",
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  pronouns: "he/him",
  skills: [],
  discord: "frog#",
  verified: true,
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/0xmcg",
}
const abe: AccountMetadata & { address: string } = {
  name: "Abe",
  handle: "cryptoabe",
  address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  pronouns: "he/him",
  skills: [],
  discord: "cryptoabe#",
  verified: true,
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/abenazer_mekete",
}
const nick: AccountMetadata & { address: string } = {
  name: "Nick",
  handle: "zy2",
  address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  pronouns: "he/him",
  skills: [],
  discord: "zy2#",
  verified: true,
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/zy22yz",
}
const alli: AccountMetadata & { address: string } = {
  name: "Alli",
  handle: "alli",
  address: "0x32447704a3ac5ed491b6091497ffb67a7733b624",
  pronouns: "she/her",
  skills: [],
  discord: "alli#",
  verified: true,
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/sonofalli",
}
const kassen: AccountMetadata & { address: string } = {
  name: "Kassen",
  handle: "kassen",
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  pronouns: "she/her",
  skills: [],
  discord: "kassen#",
  verified: true,
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/kassenq",
}
const alex: AccountMetadata & { address: string } = {
  name: "Alex",
  handle: "ahs",
  address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  pronouns: "he/him",
  skills: [],
  discord: "ahs#",
  verified: true,
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/alexhughsam",
}
const akshay: AccountMetadata & { address: string } = {
  name: "Akshay",
  handle: "wagmiking",
  address: "0x8FAA5498Ca6fc9A61BA967E07fBc9420aab99E55",
  pronouns: "he/him",
  skills: [],
  discord: "wagmiking#",
  verified: true,
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/wagmiking",
}

export const contributors = {
  tina,
  mind,
  conner,
  kristen,
  calvin,
  brendan,
  michael,
  abe,
  nick,
  alli,
  kassen,
  alex,
  akshay,
}

const contributorList: (AccountMetadata & { address: string })[] = [
  tina,
  mind,
  conner,
  kristen,
  calvin,
  brendan,
  michael,
  abe,
  nick,
  alli,
  kassen,
  alex,
  akshay,
]

export async function seedContributors() {
  for (const name in contributorList) {
    const contributorData = contributorList[name]
    await db.account.upsert({
      where: { address: contributorData!.address },
      create: { address: contributorData!.address, data: contributorData },
      update: { data: contributorData },
    })
  }
}
