import db from "../index"
import { AccountMetadata } from "app/account/types"

function contributor(
  address,
  name,
  handle,
  pronouns,
  skills,
  discord,
  verified
): AccountMetadata & { address: string } {
  return {
    address,
    name,
    handle,
    pronouns,
    skills,
    discord,
    verified,
  }
}

const mind = contributor(
  "Mind",
  "mindapi",
  "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  "she/her",
  [],
  "mindapi#",
  true
)
const tina = contributor(
  "Tina",
  "fakepixels",
  "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  "she/her",
  [],
  "fakepixels#",
  true
)
const conner = contributor(
  "Conner",
  "symmtry",
  "0x016562aA41A8697720ce0943F003141f5dEAe006",
  "he/him",
  [],
  "symmtry#",
  true
)
const kristen = contributor(
  "Kristen",
  "rie",
  "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  "she/her",
  [],
  "rie#",
  true
)
const calvin = contributor(
  "Calvin",
  "cc2",
  "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  "he/him",
  [],
  "cc2#",
  true
)
const brendan = contributor(
  "Brendan",
  "brendo",
  "0x17B7163E708A06De4DdA746266277470dd42C53f",
  "he/him",
  [],
  "#",
  true
)
const michael = contributor(
  "Michael",
  "frog",
  "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  "he/him",
  [],
  "frog#",
  true
)
const abe = contributor(
  "Abe",
  "cryptoabe",
  "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  "he/him",
  [],
  "cryptoabe#",
  true
)
const nick = contributor(
  "Nick",
  "zy2",
  "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  "he/him",
  [],
  "zy2#",
  true
)
const alli = contributor(
  "Alli",
  "alli",
  "0x32447704a3ac5ed491b6091497ffb67a7733b624",
  "she/her",
  [],
  "alli#",
  true
)
const kassen = contributor(
  "Kassen",
  "kassen",
  "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  "she/her",
  [],
  "kassen#",
  true
)
const alex = contributor(
  "Alex",
  "ahs",
  "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  "he/him",
  [],
  "ahs#",
  true
)
const akshay = contributor(
  "Akshay",
  "wagmiking",
  "0x8FAA5498Ca6fc9A61BA967E07fBc9420aab99E55",
  "he/him",
  [],
  "wagmiking#",
  true
)

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
    let account = await db.account.create({
      data: {
        address: contributorData!.address,
        data: {
          contributorData,
        },
      },
    })
  }
}
