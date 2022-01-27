import db from "../index"
import { TerminalMetadata, Terminal } from "app/terminal/types"

const stationMetadata: TerminalMetadata & { ticketAddress: string } = {
  name: "Station",
  handle: "station",
  description: "Building the infrastructure to empower the next billion contributors in web3.",
  ticketAddress: "0xbe26ee78ba287e5c6a862258db9c5e7fe7538f56",
  pfpURL: "https://pbs.twimg.com/profile_images/1465787628553310211/DOMgJi5d_400x400.jpg",
}

const terminalMap = {
  stationMetadata,
}

export async function seedTerminals() {
  let terminals = {}
  for (let terminalId in terminalMap) {
    let terminalMetadata = terminalMap[terminalId]

    let updatedTerminal = (await db.terminal.upsert({
      where: { ticketAddress: terminalMetadata.ticketAddress },
      create: {
        ticketAddress: terminalMetadata.ticketAddress,
        handle: terminalMetadata.handle.toLowerCase(),
        data: terminalMetadata,
      },
      update: {
        data: terminalMetadata,
      },
    })) as Terminal

    terminals[updatedTerminal.data.name] = updatedTerminal
  }
  console.log(`Updated terminals`)
  return terminals
}
