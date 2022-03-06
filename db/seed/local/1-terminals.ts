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

const station: CreateTerminalParams = {
  handle: "stationlabs",
  ticketAddress: "0xbe26ee78ba287e5c6a862258db9c5e7fe7538f56",
  data: {
    name: "Station Labs",
    description: "Creating on-chain infrastructure for a new genre of work.",
    coverURL: "https://station-images.nyc3.digitaloceanspaces.com/station-cover.png",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/station.jpeg",
    permissions: {
      invite: {
        rolesAllowedToInvite: [1], // local id for STAFF
        [roleIds.staff]: [
          roleIds.staff,
          roleIds.dailyCommuter,
          roleIds.weekendCommuter,
          roleIds.visitor,
        ], // local id for STAFF
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
  const terminals = [station]
  for (const name in terminals) {
    const terminalData = terminals[name] as CreateTerminalParams
    ;(await db.terminal.create({
      data: terminalData,
    })) as Terminal
  }
}

export default seed
