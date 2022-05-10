import db from "../../index"
import { Terminal, TerminalMetadata } from "app/terminal/types"

interface CreateTerminalParams {
  ticketAddress: string
  handle: string
  data: TerminalMetadata
}

export const roleIds = {
  staff: 1,
  dailyCommuter: 2,
  weekendCommuter: 3,
  visitor: 4,
}

const ccs: CreateTerminalParams = {
  handle: "ccs",
  ticketAddress: "0x",
  data: {
    guildId: "882488248591593553",
    name: "Crypto, Culture and Society",
    description:
      "A learning DAO building the liberal arts for crypto and exploring web3’s broader societal impact.",
    coverURL: "https://station-images.nyc3.digitaloceanspaces.com/css_cover.png",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs.jpeg",
    permissions: {
      invite: {
        [roleIds.staff]: [
          roleIds.staff,
          roleIds.dailyCommuter,
          roleIds.weekendCommuter,
          roleIds.visitor,
        ], // local id for STAFF
      },
      edit: {
        initiative: [roleIds.staff],
      },
    },
    contracts: {
      addresses: {
        endorsements: "0x7C3EAb35c5B87F4BBea7E3127Ebfb3ba55E94B0C",
        points: "0xECf0f56d3976aFdD67504C49d957987bA712d686",
        referrals: "0xCb4ECe9DcA605A7109eDB02d94e8292AF76F71b8",
      },
      symbols: {
        endorsements: "LEARN🅔",
        points: "LEARN🅟",
        referrals: "LEARN🅡",
      },
    },
  },
}

const station: CreateTerminalParams = {
  handle: "stationlabs",
  ticketAddress: "0xbe26ee78ba287e5c6a862258db9c5e7fe7538f56",
  data: {
    guildId: "882488248591593553",
    name: "Station Labs",
    description: "Creating on-chain infrastructure for a new genre of work.",
    coverURL: "https://station-images.nyc3.digitaloceanspaces.com/station-cover.png",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/station.jpeg",
    permissions: {
      invite: {
        [roleIds.staff]: [
          roleIds.staff,
          roleIds.dailyCommuter,
          roleIds.weekendCommuter,
          roleIds.visitor,
        ], // local id for STAFF
      },
      edit: {
        initiative: [roleIds.staff],
      },
    },
    contracts: {
      addresses: {
        endorsements: "0xABf03EDC17De11e80008C3e89919b82AbA34521A",
        points: "0x09B29bcb130E4A642f270AF3F6bDf2480D065835",
        referrals: "0x488d547e5C383d66815c67fB1356A3F35d3885CF",
      },
      symbols: {
        endorsements: "RAIL🅔",
        points: "RAIL🅟",
        referrals: "RAIL🅡",
      },
    },
  },
}

const seed = async () => {
  console.log("Seeding Terminals")
  const terminals = [station, ccs]
  for (const name in terminals) {
    const terminalData = terminals[name] as CreateTerminalParams
    ;(await db.terminal.create({
      data: terminalData,
    })) as Terminal
  }
}

export default seed
