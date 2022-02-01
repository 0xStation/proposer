import db from "../index"
import { AccountMetadata } from "app/account/types"
import uploadToS3 from "app/utils/uploadToS3"
import { genSVG } from "app/ticket/svg"

const mind: AccountMetadata & { address: string } = {
  name: "paprika",
  address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  ticketId: 2, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "paprika#0027",
  verified: true,
  timezone: "EST",
  ens: "spicypaprika.eth",
  role: "STAFF",
  twitterURL: "https://twitter.com/mindapi_",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036023-44570a89-315b-42cb-8a97-fc48c60f1e7a.png",
}
const tina: AccountMetadata & { address: string } = {
  name: "fakepixels",
  address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  ticketId: 3, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "fakepixels#6258",
  verified: true,
  timezone: "EST",
  ens: "fkpixels.eth",
  role: "STAFF",
  twitterURL: "https://twitter.com/fkpxls",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036016-db43df6c-e240-4f63-aaff-6843d278a2ba.png",
  initiatives: [3, 4, 6],
}
const conner: AccountMetadata & { address: string } = {
  name: "symmetry",
  address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  ticketId: 0, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "symmtry#0069",
  verified: true,
  timezone: "EST",
  ens: "symmtry.eth",
  role: "STAFF",
  twitterURL: "https://twitter.com/symmtry69",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036030-3c4f0d7b-0946-4ccc-b03b-03fb6e57328e.png",
}
const kristen: AccountMetadata & { address: string } = {
  name: "rie",
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  ticketId: 7, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "rie#9502",
  verified: true,
  timezone: "EST",
  ens: "rielity.eth",
  role: "STAFF",
  twitterURL: "https://twitter.com/0xRie_",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036026-9e4d09b3-8d1b-4261-8a2c-e121146f7d63.png",
}
const calvin: AccountMetadata & { address: string } = {
  name: "cc2",
  address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  ticketId: 6, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "cc2#2803",
  verified: true,
  timezone: "EST",
  // ens: "",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/cchengasaurus",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036007-6e11bb26-6edd-4c9b-9c1c-aa1814e36f11.png",
}
const brendan: AccountMetadata & { address: string } = {
  name: "brendo",
  address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
  ticketId: 4, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "brendo#9038",
  verified: true,
  timezone: "EST",
  ens: "brendo.eth",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/brendanelliot_",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036006-018105d4-e8d4-4fb7-bc82-997351d38d2d.png",
}
const michael: AccountMetadata & { address: string } = {
  name: "frog",
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  ticketId: 1, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "frog#3881",
  verified: true,
  timezone: "EST",
  ens: "0xmcg.eth",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/0xmcg",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036018-25f65c4d-a968-4c6c-b328-15958acdb649.png",
}
const abe: AccountMetadata & { address: string } = {
  name: "cryptoabe",
  address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  ticketId: 12, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "cryptoabe#3656",
  verified: true,
  timezone: "EST",
  // ens: "",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/abenazer_mekete",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036010-b47feac0-99c5-43a6-963d-89a89aa47ff7.png",
}
const nick: AccountMetadata & { address: string } = {
  name: "zy2",
  address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  ticketId: 13, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "zy2#2240",
  verified: true,
  timezone: "EST",
  ens: "zy22yz.eth",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/zy22yz",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036033-abee8f5d-544a-491f-b442-67d4b90639b1.png",
}
const alli: AccountMetadata & { address: string } = {
  name: "alli",
  address: "0x32447704a3ac5ed491b6091497ffb67a7733b624",
  ticketId: 10, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "alli#3226",
  verified: true,
  timezone: "EST",
  ens: "sonofalli.eth",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/sonofalli",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036002-396279ab-0f10-4c61-b2dc-23dea07236f9.png",
}
const kassen: AccountMetadata & { address: string } = {
  name: "kassen",
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  ticketId: 11, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "kass#7081",
  verified: true,
  timezone: "EST",
  ens: "kassen.eth",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/kassenq",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036021-6bb5fde3-aef3-4a76-a543-3036c99b8ad0.png",
}
const alex: AccountMetadata & { address: string } = {
  name: "ahs",
  address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  ticketId: 14, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "ahs#6679",
  verified: true,
  timezone: "EST",
  // ens: "",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/alexhughsam",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152035995-3aabcfcc-8fee-4d5c-9c37-17b7f51cfcfd.png",
}
const akshay: AccountMetadata & { address: string } = {
  name: "wagmiking",
  address: "0x8FAA5498Ca6fc9A61BA967E07fBc9420aab99E55",
  ticketId: 9, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "wagmiking#0978",
  verified: true,
  timezone: "EST",
  // ens: "",
  role: "VISITOR",
  twitterURL: "https://twitter.com/wagmiking",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036031-7d5b3fd2-69b7-42f1-8aca-23fece63fc91.png",
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

export async function seedContributors(terminals) {
  for (const name in contributors) {
    const contributorData = contributors[name] as AccountMetadata & {
      address: string
    }

    const existingAccount = await db.account.upsert({
      where: { address: contributorData!.address },
      create: {
        address: contributorData!.address,
        role: contributorData.role,
        data: contributorData,
        tickets: {
          create: [
            {
              ticketUrl:
                "https://station.nyc3.digitaloceanspaces.com/tickets/ca77b341-502b-465e-b8ef-17a298ebd2e6.svg",
              active: true,
              terminal: {
                connect: {
                  id: terminals.station.id,
                },
              },
            },
          ],
        },
      },
      update: {
        data: contributorData,
        role: contributorData.role,
      },
    })

    let props = {
      address: contributorData!.address,
      name: contributorData!.name,
      role: contributorData!.role || "VISITOR",
      terminal: "Station",
    }

    // let ticketSVG = genSVG(props)

    // const path = `tickets/station/${contributorData.handle}.svg`
    // const uploadedImageResponse = await uploadToS3(ticketSVG, path)
    // const uploadedImagePath = uploadedImageResponse.Location

    await db.account.update({
      where: { address: props.address },
      data: {
        data: {
          ...(existingAccount.data as {}),
          // ticketImage: uploadedImagePath
        },
      },
    })
  }
}
