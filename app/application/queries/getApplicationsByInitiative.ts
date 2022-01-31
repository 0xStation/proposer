import db from "db"
import * as z from "zod"
import { Application, Referral } from "app/application/types"
import { request, gql } from "graphql-request"
import { Account } from "app/account/types"

const GetApplicationsByInitiative = z.object({
  initiativeId: z.number(),
})

const accounts: Account[] = [
  {
    id: 0,
    address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
    data: {
      name: "Mind",
      handle: "mindapi",
      ticketId: 2, // TODO: remove this when subgraph is ready
      pronouns: "she/her",
      skills: ["design"],
      discordId: "mindapi#",
      verified: true,
      timezone: "EST",
      wallet: "mindapi.eth",
      role: "STAFF",
      twitterURL: "https://twitter.com/mindapi_",
      pfpURL: "https://pbs.twimg.com/profile_images/1466504048006377472/KrC6aPam_400x400.jpg",
    },
  },
  {
    id: 1,
    address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
    data: {
      name: "Tina",
      handle: "fakepixels",
      ticketId: 3, // TODO: remove this when subgraph is ready
      pronouns: "she/her",
      skills: ["Partnerships", "Tokenomics", "Product Strategy", "Hiring"],
      discordId: "fakepixels#",
      verified: true,
      timezone: "EST",
      wallet: "fkpixels.eth",
      role: "STAFF",
      twitterURL: "https://twitter.com/fkpxls",
      pfpURL: "https://pbs.twimg.com/profile_images/1470115904289574913/7t4TlLQd_400x400.jpg",
    },
  },
  {
    id: 2,
    address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
    data: {
      name: "Conner",
      handle: "symmtry",
      ticketId: 0, // TODO: remove this when subgraph is ready
      pronouns: "he/him",
      skills: ["solidity", "subgraph", "backend"],
      discordId: "symmtry#",
      verified: true,
      timezone: "EST",
      wallet: "symmtry.eth",
      role: "STAFF",
      twitterURL: "https://twitter.com/symmtry69",
      pfpURL: "https://pbs.twimg.com/profile_images/1466148504934309888/mighngBe_400x400.jpg",
    },
  },
  {
    id: 3,
    address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
    data: {
      name: "Kristen",
      handle: "rie",
      ticketId: 7, // TODO: remove this when subgraph is ready
      pronouns: "she/her",
      skills: ["frontend"],
      discordId: "rie#",
      verified: true,
      timezone: "EST",
      wallet: "0x420...6d9",
      role: "STAFF",
      twitterURL: "https://twitter.com/0xRie_",
      pfpURL: "https://pbs.twimg.com/profile_images/1480639057914855424/LiE4wCe2_400x400.jpg",
    },
  },
  {
    id: 4,
    address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
    data: {
      name: "Calvin",
      handle: "cc2",
      ticketId: 6, // TODO: remove this when subgraph is ready
      pronouns: "he/him",
      skills: ["tokenomics", "partnerships"],
      discordId: "cc2#",
      verified: true,
      timezone: "EST",
      wallet: "0x420...6d9",
      role: "COMMUTER",
      twitterURL: "https://twitter.com/cchengasaurus",
      pfpURL: "https://pbs.twimg.com/profile_images/1383273360986054659/A3pwCK_O_400x400.png",
    },
  },
  {
    id: 5,
    address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
    data: {
      name: "Brendan",
      handle: "brendo",
      ticketId: 4, // TODO: remove this when subgraph is ready
      pronouns: "he/him",
      skills: ["design"],
      discordId: "brendo#",
      verified: true,
      timezone: "EST",
      wallet: "brendo.eth",
      role: "COMMUTER",
      twitterURL: "https://twitter.com/brendanelliot_",
      pfpURL: "https://pbs.twimg.com/profile_images/1474473416354902023/sJMCansO_400x400.jpg",
    },
  },
  {
    id: 6,
    address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
    data: {
      name: "Michael",
      handle: "frog",
      ticketId: 1, // TODO: remove this when subgraph is ready
      pronouns: "he/him",
      skills: ["frontend", "backend"],
      discordId: "frog#",
      verified: true,
      timezone: "EST",
      wallet: "0x420...6d9",
      role: "COMMUTER",
      twitterURL: "https://twitter.com/0xmcg",
      pfpURL: "https://pbs.twimg.com/profile_images/1480358868349714433/v7YwGkCb_400x400.jpg",
    },
  },
  {
    id: 7,
    address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
    data: {
      name: "Abe",
      handle: "cryptoabe",
      ticketId: 12, // TODO: remove this when subgraph is ready
      pronouns: "he/him",
      skills: ["frontend", "product"],
      discordId: "cryptoabe#",
      verified: true,
      timezone: "EST",
      wallet: "0x420...6d9",
      role: "COMMUTER",
      twitterURL: "https://twitter.com/abenazer_mekete",
      pfpURL: "https://pbs.twimg.com/profile_images/1480266187934257155/aRArmGkH_400x400.jpg",
    },
  },
  {
    id: 8,
    address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
    data: {
      name: "Nick",
      handle: "zy2",
      ticketId: 13, // TODO: remove this when subgraph is ready
      pronouns: "he/him",
      skills: ["solidity", "product"],
      discordId: "zy2#",
      verified: true,
      timezone: "EST",
      wallet: "0x420...6d9",
      role: "COMMUTER",
      twitterURL: "https://twitter.com/zy22yz",
      pfpURL: "https://pbs.twimg.com/profile_images/1480623159048957952/YMEGfCbN_400x400.jpg",
    },
  },
  {
    id: 9,
    address: "0x32447704a3ac5ed491b6091497ffb67a7733b624",
    data: {
      name: "Alli",
      handle: "alli",
      ticketId: 10, // TODO: remove this when subgraph is ready
      pronouns: "she/her",
      skills: ["knowledge management", "marketing", "project management"],
      discordId: "alli#",
      verified: true,
      timezone: "EST",
      wallet: "0x420...6d9",
      role: "COMMUTER",
      twitterURL: "https://twitter.com/sonofalli",
      pfpURL: "https://pbs.twimg.com/profile_images/1467974510540251142/8Tld5x0g_400x400.jpg",
    },
  },
  {
    id: 10,
    address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
    data: {
      name: "Kassen",
      handle: "kassen",
      ticketId: 11, // TODO: remove this when subgraph is ready
      pronouns: "she/her",
      skills: ["partnerships", "product", "writing"],
      discordId: "kassen#",
      verified: true,
      timezone: "EST",
      wallet: "0x420...6d9",
      role: "COMMUTER",
      twitterURL: "https://twitter.com/kassenq",
      pfpURL: "https://pbs.twimg.com/profile_images/1447546582019289089/6FTxfXBw_400x400.jpg",
    },
  },
  {
    id: 11,
    address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
    data: {
      name: "Alex",
      handle: "ahs",
      ticketId: 14, // TODO: remove this when subgraph is ready
      pronouns: "he/him",
      skills: ["content management", "writing", "knowledge management"],
      discordId: "ahs#",
      verified: true,
      timezone: "EST",
      wallet: "0x420...6d9",
      role: "COMMUTER",
      twitterURL: "https://twitter.com/alexhughsam",
      pfpURL: "https://pbs.twimg.com/profile_images/1444053434383147017/NHJoWE9j_400x400.jpg",
    },
  },
]

const apps = {
  1: [
    {
      createdAt: new Date(2022, 1, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "mima.com",
      },
      applicant: {
        id: 12,
        address: "0xabc",
        data: {
          name: "mima",
          handle: "mima.eth",
          pronouns: "he/him",
          skills: ["design"],
          discordId: "mimadiscord#",
          verified: false,
          timezone: "EST",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/mima.eth",
          pfpURL: "https://pbs.twimg.com/media/FCzyD5LWUAYaSkm?format=jpg&name=900x900",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2021, 11, 1),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "chiyoko.com",
      },
      applicant: {
        id: 12,
        address: "0xdef",
        data: {
          name: "chiyoko",
          handle: "chiyoko.eth",
          pronouns: "she/her",
          skills: ["design"],
          discordId: "chiyokodiscord#",
          verified: false,
          timezone: "UTC",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/chiyoko.eth",
          pfpURL: "https://pbs.twimg.com/media/EkJWsELXYAQXQpT?format=jpg&name=large",
        },
      },
      points: 57,
      referrals: [
        {
          from: accounts[2],
          points: 17,
        },
        {
          from: accounts[3],
          points: 40,
        },
      ],
    },
    {
      createdAt: new Date(2021, 12, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "manofthekey.com",
      },
      applicant: {
        id: 12,
        address: "0xghi",
        data: {
          name: "manofthekey",
          handle: "manofthekey.eth",
          pronouns: "he/him",
          skills: ["web", "nft", "design", "product"],
          discordId: "manofthekeydiscord#",
          verified: false,
          timezone: "UTC",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/manofthekey.eth",
          pfpURL:
            "https://cdn.anime-planet.com/characters/primary/man-of-the-key-1-187x285.jpg?t=1625991946",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2022, 1, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "mima.com",
      },
      applicant: {
        id: 12,
        address: "0xabc",
        data: {
          name: "mima",
          handle: "mima.eth",
          pronouns: "he/him",
          skills: ["design"],
          discordId: "mimadiscord#",
          verified: false,
          timezone: "EST",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/mima.eth",
          pfpURL: "https://pbs.twimg.com/media/FCzyD5LWUAYaSkm?format=jpg&name=900x900",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2021, 11, 1),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "chiyoko.com",
      },
      applicant: {
        id: 12,
        address: "0xdef",
        data: {
          name: "chiyoko",
          handle: "chiyoko.eth",
          pronouns: "she/her",
          skills: ["design"],
          discordId: "chiyokodiscord#",
          verified: false,
          timezone: "UTC",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/chiyoko.eth",
          pfpURL: "https://pbs.twimg.com/media/EkJWsELXYAQXQpT?format=jpg&name=large",
        },
      },
      points: 57,
      referrals: [
        {
          from: accounts[2],
          points: 17,
        },
        {
          from: accounts[3],
          points: 40,
        },
      ],
    },
    {
      createdAt: new Date(2021, 12, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "manofthekey.com",
      },
      applicant: {
        id: 12,
        address: "0xghi",
        data: {
          name: "manofthekey",
          handle: "manofthekey.eth",
          pronouns: "he/him",
          skills: ["web", "nft", "design", "product"],
          discordId: "manofthekeydiscord#",
          verified: false,
          timezone: "UTC",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/manofthekey.eth",
          pfpURL:
            "https://cdn.anime-planet.com/characters/primary/man-of-the-key-1-187x285.jpg?t=1625991946",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2022, 1, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "mima.com",
      },
      applicant: {
        id: 12,
        address: "0xabc",
        data: {
          name: "mima",
          handle: "mima.eth",
          pronouns: "he/him",
          skills: ["design"],
          discordId: "mimadiscord#",
          verified: false,
          timezone: "EST",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/mima.eth",
          pfpURL: "https://pbs.twimg.com/media/FCzyD5LWUAYaSkm?format=jpg&name=900x900",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2021, 11, 1),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "chiyoko.com",
      },
      applicant: {
        id: 12,
        address: "0xdef",
        data: {
          name: "chiyoko",
          handle: "chiyoko.eth",
          pronouns: "she/her",
          skills: ["design"],
          discordId: "chiyokodiscord#",
          verified: false,
          timezone: "UTC",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/chiyoko.eth",
          pfpURL: "https://pbs.twimg.com/media/EkJWsELXYAQXQpT?format=jpg&name=large",
        },
      },
      points: 57,
      referrals: [
        {
          from: accounts[2],
          points: 17,
        },
        {
          from: accounts[3],
          points: 40,
        },
      ],
    },
    {
      createdAt: new Date(2021, 12, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "manofthekey.com",
      },
      applicant: {
        id: 12,
        address: "0xghi",
        data: {
          name: "manofthekey",
          handle: "manofthekey.eth",
          pronouns: "he/him",
          skills: ["web", "nft", "design", "product"],
          discordId: "manofthekeydiscord#",
          verified: false,
          timezone: "UTC",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/manofthekey.eth",
          pfpURL:
            "https://cdn.anime-planet.com/characters/primary/man-of-the-key-1-187x285.jpg?t=1625991946",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2022, 1, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "mima.com",
      },
      applicant: {
        id: 12,
        address: "0xabc",
        data: {
          name: "mima",
          handle: "mima.eth",
          pronouns: "he/him",
          skills: ["design"],
          discordId: "mimadiscord#",
          verified: false,
          timezone: "EST",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/mima.eth",
          pfpURL: "https://pbs.twimg.com/media/FCzyD5LWUAYaSkm?format=jpg&name=900x900",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2021, 11, 1),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "chiyoko.com",
      },
      applicant: {
        id: 12,
        address: "0xdef",
        data: {
          name: "chiyoko",
          handle: "chiyoko.eth",
          pronouns: "she/her",
          skills: ["design"],
          discordId: "chiyokodiscord#",
          verified: false,
          timezone: "UTC",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/chiyoko.eth",
          pfpURL: "https://pbs.twimg.com/media/EkJWsELXYAQXQpT?format=jpg&name=large",
        },
      },
      points: 57,
      referrals: [
        {
          from: accounts[2],
          points: 17,
        },
        {
          from: accounts[3],
          points: 40,
        },
      ],
    },
    {
      createdAt: new Date(2021, 12, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "manofthekey.com",
      },
      applicant: {
        id: 12,
        address: "0xghi",
        data: {
          name: "manofthekey",
          handle: "manofthekey.eth",
          pronouns: "he/him",
          skills: ["web", "nft", "design", "product"],
          discordId: "manofthekeydiscord#",
          verified: false,
          timezone: "UTC",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/manofthekey.eth",
          pfpURL:
            "https://cdn.anime-planet.com/characters/primary/man-of-the-key-1-187x285.jpg?t=1625991946",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2022, 1, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "mima.com",
      },
      applicant: {
        id: 12,
        address: "0xabc",
        data: {
          name: "mima",
          handle: "mima.eth",
          pronouns: "he/him",
          skills: ["design"],
          discordId: "mimadiscord#",
          verified: false,
          timezone: "EST",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/mima.eth",
          pfpURL: "https://pbs.twimg.com/media/FCzyD5LWUAYaSkm?format=jpg&name=900x900",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2021, 11, 1),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "chiyoko.com",
      },
      applicant: {
        id: 12,
        address: "0xdef",
        data: {
          name: "chiyoko",
          handle: "chiyoko.eth",
          pronouns: "she/her",
          skills: ["design"],
          discordId: "chiyokodiscord#",
          verified: false,
          timezone: "UTC",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/chiyoko.eth",
          pfpURL: "https://pbs.twimg.com/media/EkJWsELXYAQXQpT?format=jpg&name=large",
        },
      },
      points: 57,
      referrals: [
        {
          from: accounts[2],
          points: 17,
        },
        {
          from: accounts[3],
          points: 40,
        },
      ],
    },
    {
      createdAt: new Date(2021, 12, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "manofthekey.com",
      },
      applicant: {
        id: 12,
        address: "0xghi",
        data: {
          name: "manofthekey",
          handle: "manofthekey.eth",
          pronouns: "he/him",
          skills: ["web", "nft", "design", "product"],
          discordId: "manofthekeydiscord#",
          verified: false,
          timezone: "UTC",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/manofthekey.eth",
          pfpURL:
            "https://cdn.anime-planet.com/characters/primary/man-of-the-key-1-187x285.jpg?t=1625991946",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
  ],
  2: [
    {
      createdAt: new Date(2022, 1, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "abe.com",
      },
      applicant: {
        id: 12,
        address: "0xabc",
        data: {
          name: "mima",
          handle: "mima.eth",
          pronouns: "he/him",
          skills: ["design"],
          discordId: "mimadiscord#",
          verified: false,
          timezone: "EST",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/mima.eth",
          pfpURL: "",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
  ],
  3: [
    {
      createdAt: new Date(2022, 1, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "abe.com",
      },
      applicant: {
        id: 12,
        address: "0xabc",
        data: {
          name: "mima",
          handle: "mima.eth",
          pronouns: "he/him",
          skills: ["design"],
          discordId: "mimadiscord#",
          verified: false,
          timezone: "EST",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/mima.eth",
          pfpURL: "",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2022, 1, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "abe.com",
      },
      applicant: {
        id: 12,
        address: "0xabc",
        data: {
          name: "mima",
          handle: "mima.eth",
          pronouns: "he/him",
          skills: ["design"],
          discordId: "mimadiscord#",
          verified: false,
          timezone: "EST",
          wallet: "0x420...6d9",
          twitterURL: "https://twitter.com/mima.eth",
          pfpURL: "",
        },
      },
      points: 16,
      referrals: [
        {
          from: accounts[0],
          points: 15,
        },
        {
          from: accounts[1],
          points: 1,
        },
      ],
    },
    {
      createdAt: new Date(2022, 1, 29),
      data: {
        entryDescription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "kristencheung.com",
      },
      applicant: accounts[3],
      points: 70,
      referrals: [
        {
          from: accounts[2],
          points: 5,
        },
        {
          from: accounts[3],
          points: 25,
        },
        {
          from: accounts[5],
          points: 30,
        },
        {
          from: accounts[6],
          points: 5,
        },
        {
          from: accounts[7],
          points: 5,
        },
      ],
    },
  ],
}

export default async function getApplicationsByInitiative(
  input: z.infer<typeof GetApplicationsByInitiative>
) {
  const data = GetApplicationsByInitiative.parse(input)
  const { initiativeId } = data

  // let FETCH_WAITING_ROOM_ENDORSEMENTS = gql`
  //   {
  //     initiatives (where: {localId: "${data.initiativeId}"}) {
  //       endorsees {
  //         address
  //         totalEndorsed
  //         endorsements { # list of endorsement objects
  //           from # address
  //           amount
  //           timestamp
  //         }
  //       }
  //     }
  //   }
  // `

  // let endorsementData = await request(
  //   "https://thegraph.com/hosted-service/subgraph/0xstation/station",
  //   FETCH_WAITING_ROOM_ENDORSEMENTS
  // )

  // const applications = await db.initiativeApplication.findMany({
  //   where: { initiativeId: data.initiativeId },
  //   include: { applicant: true },
  // })
  // if (!applications) {
  //   return []
  // }

  const applications = apps[initiativeId]

  return applications as Application[]
}
