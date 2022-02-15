import db from "../../index"
import { Terminal, TerminalMetadata } from "app/terminal/types"

interface CreateTerminalParams {
  ticketAddress: string
  handle: string
  data: TerminalMetadata
}

const station: CreateTerminalParams = {
  handle: "stationlabs",
  ticketAddress: "0xbe26ee78ba287e5c6a862258db9c5e7fe7538f56",
  data: {
    name: "Station Labs",
    description: "Creating on-chain infrastructure for a new genre of work.",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/station.jpeg",
    permissions: {
      invite: [1], // local id for STAFF
    },
  },
}

const seed = async () => {
  console.log("Seeding Terminals")
  const terminals = [station]
  for (const name in terminals) {
    const terminalData = terminals[name] as CreateTerminalParams
    let terminal = (await db.terminal.create({
      data: terminalData,
    })) as Terminal
  }
}

export default seed
