import db from "../index"
import { AccountMetadata } from "app/account/types"
import uploadToS3 from "app/utils/uploadToS3"
import { genSVG } from "app/ticket/svg"

const mind: AccountMetadata & { address: string } = {
  name: "Mind",
  handle: "mindapi",
  address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  ticketId: 2, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "mindapi#",
  verified: true,
  timezone: "EST",
  wallet: "mindapi.eth",
  role: "STAFF",
  twitterURL: "https://twitter.com/mindapi_",
  pfpURL: "https://pbs.twimg.com/profile_images/1466504048006377472/KrC6aPam_400x400.jpg",
}
const tina: AccountMetadata & { address: string } = {
  name: "Tina",
  handle: "fakepixels",
  address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  ticketId: 3, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "fakepixels#",
  verified: true,
  timezone: "EST",
  wallet: "fkpixels.eth",
  role: "STAFF",
  twitterURL: "https://twitter.com/fkpxls",
  pfpURL: "https://pbs.twimg.com/profile_images/1470115904289574913/7t4TlLQd_400x400.jpg",
}
const conner: AccountMetadata & { address: string } = {
  name: "Conner",
  handle: "symmtry",
  address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  ticketId: 0, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "symmtry#",
  verified: true,
  timezone: "EST",
  wallet: "symmtry.eth",
  role: "STAFF",
  twitterURL: "https://twitter.com/symmtry69",
  pfpURL: "https://pbs.twimg.com/profile_images/1466148504934309888/mighngBe_400x400.jpg",
}
const kristen: AccountMetadata & { address: string } = {
  name: "Kristen",
  handle: "rie",
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  ticketId: 7, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "rie#",
  verified: true,
  timezone: "EST",
  wallet: "0x420...6d9",
  role: "STAFF",
  twitterURL: "https://twitter.com/0xRie_",
  pfpURL: "https://pbs.twimg.com/profile_images/1480639057914855424/LiE4wCe2_400x400.jpg",
}
const calvin: AccountMetadata & { address: string } = {
  name: "Calvin",
  handle: "cc2",
  address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  ticketId: 6, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "cc2#",
  verified: true,
  timezone: "EST",
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/cchengasaurus",
  pfpURL: "https://pbs.twimg.com/profile_images/1383273360986054659/A3pwCK_O_400x400.png",
}
const brendan: AccountMetadata & { address: string } = {
  name: "Brendan",
  handle: "brendo",
  address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
  ticketId: 4, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "brendo#",
  verified: true,
  timezone: "EST",
  wallet: "brendo.eth",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/brendanelliot_",
  pfpURL: "https://pbs.twimg.com/profile_images/1474473416354902023/sJMCansO_400x400.jpg",
}
const michael: AccountMetadata & { address: string } = {
  name: "Michael",
  handle: "frog",
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  ticketId: 1, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "frog#",
  verified: true,
  timezone: "EST",
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/0xmcg",
  pfpURL: "https://pbs.twimg.com/profile_images/1480358868349714433/v7YwGkCb_400x400.jpg",
}
const abe: AccountMetadata & { address: string } = {
  name: "Abe",
  handle: "cryptoabe",
  address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  ticketId: 12, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "cryptoabe#",
  verified: true,
  timezone: "EST",
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/abenazer_mekete",
  pfpURL: "https://pbs.twimg.com/profile_images/1480266187934257155/aRArmGkH_400x400.jpg",
}
const nick: AccountMetadata & { address: string } = {
  name: "Nick",
  handle: "zy2",
  address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  ticketId: 13, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "zy2#",
  verified: true,
  timezone: "EST",
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/zy22yz",
  pfpURL: "https://pbs.twimg.com/profile_images/1480623159048957952/YMEGfCbN_400x400.jpg",
}
const alli: AccountMetadata & { address: string } = {
  name: "Alli",
  handle: "alli",
  address: "0x32447704a3ac5ed491b6091497ffb67a7733b624",
  ticketId: 10, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "alli#",
  verified: true,
  timezone: "EST",
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/sonofalli",
  pfpURL: "https://pbs.twimg.com/profile_images/1467974510540251142/8Tld5x0g_400x400.jpg",
}
const kassen: AccountMetadata & { address: string } = {
  name: "Kassen",
  handle: "kassen",
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  ticketId: 11, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "kassen#",
  verified: true,
  timezone: "EST",
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/kassenq",
  pfpURL: "https://pbs.twimg.com/profile_images/1447546582019289089/6FTxfXBw_400x400.jpg",
}
const alex: AccountMetadata & { address: string } = {
  name: "Alex",
  handle: "ahs",
  address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  ticketId: 14, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "ahs#",
  verified: true,
  timezone: "EST",
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/alexhughsam",
  pfpURL: "https://pbs.twimg.com/profile_images/1444053434383147017/NHJoWE9j_400x400.jpg",
}
const akshay: AccountMetadata & { address: string } = {
  name: "Akshay",
  handle: "wagmiking",
  address: "0x8FAA5498Ca6fc9A61BA967E07fBc9420aab99E55",
  ticketId: 9, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "wagmiking#",
  verified: true,
  timezone: "EST",
  wallet: "0x420...6d9",
  role: "COMMUTER",
  twitterURL: "https://twitter.com/wagmiking",
  pfpURL: "https://pbs.twimg.com/profile_images/1484237821099405312/zYGmw04f_400x400.jpg",
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
        data: contributorData,
        role: contributorData.role,
        tickets: {
          create: [
            {
              ticketUrl:
                "https://station.nyc3.digitaloceanspaces.com/tickets/ca77b341-502b-465e-b8ef-17a298ebd2e6.svg",
              active: true,
              terminal: {
                connect: {
                  id: terminals.Station.id,
                },
              },
            },
          ],
        },
      },
      update: {
        data: contributorData,
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

    // await db.account.update({
    //   where: { address: props.address },
    //   data: { data: { ...(existingAccount.data as {}), ticketImage: uploadedImagePath } },
    // })
  }
}
