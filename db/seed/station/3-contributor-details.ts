import db from "../../index"
import { Initiative, InitiativeMetadata } from "app/initiative/types"
import { AccountMetadata } from "app/account/types"
import { data } from "autoprefixer"

interface ContributorSeed {
  address: string
  data: {
    name?: string
    ens?: string
    verified?: boolean
    pfpURL?: string
  }
}

const mind: ContributorSeed = {
  address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  data: {
    name: "paprika",
    ens: "spicypaprika.eth",
    verified: true,
  },
}
const tina: ContributorSeed = {
  address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  data: {
    name: "fakepixels",
    ens: "fkpxls.eth",
    verified: true,
  },
}
const conner: ContributorSeed = {
  address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  data: {
    name: "symmetry",
    ens: "symmtry.eth",
    verified: true,
  },
}
const calvin: ContributorSeed = {
  address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  data: {
    name: "cc2",
    // ens: "",
    verified: true,
  },
}
const kristen: ContributorSeed = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  data: {
    name: "rie",
    ens: "rielity.eth",
    verified: true,
  },
}
const brendan: ContributorSeed = {
  address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
  data: {
    name: "brendo",
    ens: "brendo.eth",
    verified: true,
  },
}
const michael: ContributorSeed = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  data: {
    name: "frog",
    ens: "0xmcg.eth",
    verified: true,
  },
}
const abe: ContributorSeed = {
  address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  data: {
    name: "cryptoabe",
    // ens: "",
    verified: true,
  },
}
const nick: ContributorSeed = {
  address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  data: {
    name: "zy2",
    ens: "zy22yz.eth",
    verified: true,
  },
}
const alli: ContributorSeed = {
  address: "0x32447704A3AC5Ed491B6091497ffB67A7733b624",
  data: {
    name: "alli",
    ens: "sonofalli.eth",
    verified: true,
  },
}
const kassen: ContributorSeed = {
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  data: {
    name: "kassen",
    ens: "kassen.eth",
    verified: true,
  },
}
const alex: ContributorSeed = {
  address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  data: {
    name: "ahs",
    // ens: "",
    verified: true,
  },
}

const custom: ContributorSeed = {
  address: "0xC9d20533c5b8a79526377e5d05dC79b87B28E92F",
  data: {
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/detactical.jpeg",
  },
}

export const stationContributors = {
  //   tina,
  //   mind,
  //   conner,
  //   kristen,
  //   calvin,
  //   brendan,
  //   michael,
  //   abe,
  //   nick,
  //   alli,
  //   kassen,
  //   alex,
  //   custom,
}

export async function seed() {
  for (const accountName in stationContributors) {
    const contributorSeed = stationContributors[accountName]! as ContributorSeed

    console.log(`${contributorSeed.data.name}`)

    const account = await db.account.findUnique({ where: { address: contributorSeed.address } })

    if (!account) {
      console.log(`no account found with name ${accountName}, address ${contributorSeed.address}`)
      continue
    }

    console.log(account.data)

    const dataCopy = JSON.parse(JSON.stringify(account.data)) as AccountMetadata

    if (contributorSeed.data.name) {
      dataCopy.name = contributorSeed.data.name
    }
    if (contributorSeed.data.ens) {
      dataCopy.ens = contributorSeed.data.ens
    }
    if (contributorSeed.data.verified) {
      dataCopy.verified = contributorSeed.data.verified
    }
    if (contributorSeed.data.pfpURL) {
      dataCopy.pfpURL = contributorSeed.data.pfpURL
    }

    await db.account.update({
      where: {
        id: account.id,
      },
      data: {
        data: dataCopy,
      },
    })

    console.log(`contributor ${contributorSeed.data.name} updated`)
  }
}
