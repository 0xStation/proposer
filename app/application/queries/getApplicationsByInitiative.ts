import db from "db"
import * as z from "zod"
import { Application } from "app/application/types"
import { request, gql } from "graphql-request"
import { Account } from "app/account/types"

const GetApplicationsByInitiative = z.object({
  initiativeId: z.number(),
})

const dummyData: Account[] = [
  {
    id: 0,
    address: "me",
    data: {
      name: "Abe",
      handle: "cryptoabe",
      pronouns: "he/him",
      skills: ["Design"],
      discordId: "cryptoabe#",
      verified: true,
      wallet: "0x420...6d9",
      role: "COMMUTER",
      twitterURL: "https://twitter.com/abenazer_mekete",
      pfpURL: "https://pbs.twimg.com/profile_images/1480266187934257155/aRArmGkH_400x400.jpg",
      timezone: "EST",
    },
  },
  {
    id: 1,
    address: "address",
    data: {
      name: "Tina",
      handle: "fakepixels",
      pronouns: "she/her",
      skills: ["Design"],
      discordId: "fakepixels#",
      verified: true,
      wallet: "fkpixels.eth",
      role: "STAFF",
      twitterURL: "https://twitter.com/fkpxls",
      pfpURL: "https://pbs.twimg.com/profile_images/1470115904289574913/7t4TlLQd_400x400.jpg",
      timezone: "EST",
    },
  },
  {
    id: 2,
    address: "address",
    data: {
      name: "Mind",
      handle: "mindapi",
      pronouns: "she/her",
      skills: ["Design"],
      discordId: "mindapi#",
      verified: true,
      wallet: "mindapi.eth",
      role: "STAFF",
      twitterURL: "https://twitter.com/mindapi_",
      pfpURL: "https://pbs.twimg.com/profile_images/1466504048006377472/KrC6aPam_400x400.jpg",
      timezone: "EST",
    },
  },
]

const apps = {
  1: [
    {
      id: 0,
      applicant: dummyData[0] as Account,
      applicantId: 0,
      points: 45,
      initiative: {
        id: 0,
        terminalId: 0,
        terminalTicket: "",
        localId: 0,
        data: {
          name: "Protocol",
          description: "",
          shortName: "",
          isAcceptingApplications: false,
          links: [],
        },
      },
      initiativeId: 0,
      endorsements: [dummyData[0] as Account],
      data: {
        entryDesription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "abe.com",
      },
      createdAt: new Date(1995, 8, 1) as Date,
    },
    {
      id: 1,
      applicant: dummyData[1] as Account,
      applicantId: 1,
      points: 0,
      initiative: {
        id: 0,
        terminalId: 0,
        terminalTicket: "",
        localId: 0,
        data: {
          name: "Protocol",
          description: "",
          shortName: "",
          isAcceptingApplications: false,
          links: [],
        },
      },
      initiativeId: 1,
      endorsements: [dummyData[0] as Account, dummyData[1] as Account],
      data: {
        entryDesription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "abe.com",
      },
      createdAt: new Date(1995, 8, 1) as Date,
    },
    {
      id: 2,
      applicant: dummyData[2] as Account,
      applicantId: 2,
      points: 200,
      initiative: {
        id: 0,
        terminalId: 0,
        terminalTicket: "",
        localId: 0,
        data: {
          name: "Protocol",
          description: "",
          shortName: "",
          isAcceptingApplications: false,
          links: [],
        },
      },
      initiativeId: 2,
      endorsements: [],
      data: {
        entryDesription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "abe.com",
      },
      createdAt: new Date(1995, 8, 1) as Date,
    },
  ],
  2: [
    {
      id: 2,
      applicant: dummyData[2] as Account,
      applicantId: 2,
      points: 4,
      initiative: {
        id: 0,
        terminalId: 0,
        terminalTicket: "",
        localId: 0,
        data: {
          name: "Web",
          description: "",
          shortName: "",
          isAcceptingApplications: false,
          links: [],
        },
      },
      initiativeId: 2,
      endorsements: [],
      data: {
        entryDesription:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laudantium officiavquibusdam ratione porro voluptate corporis ipsa quis? Officia assumenda quam aspernatur illo dicta doloribus nisi saepe atque consequuntur voluptates?",
        url: "abe.com",
      },
      createdAt: new Date(1995, 8, 1) as Date,
    },
  ],
  3: [
    {
      id: 1,
      applicant: dummyData[1] as Account,
      applicantId: 1,
      points: 15,
      initiative: {
        id: 0,
        terminalId: 0,
        terminalTicket: "",
        localId: 0,
        data: {
          name: "Newstand",
          description: "",
          shortName: "",
          isAcceptingApplications: false,
          links: [],
        },
      },
      initiativeId: 1,
      endorsements: [],
      data: {},
      createdAt: new Date(1995, 8, 1) as Date,
    },
    {
      id: 2,
      applicant: dummyData[2] as Account,
      applicantId: 2,
      points: 1,
      initiative: {
        id: 0,
        terminalId: 0,
        terminalTicket: "",
        localId: 0,
        data: {
          name: "Newstand",
          description: "",
          shortName: "",
          isAcceptingApplications: false,
          links: [],
        },
      },
      initiativeId: 2,
      endorsements: [],
      data: {},
      createdAt: new Date(1995, 8, 1) as Date,
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
