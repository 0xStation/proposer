import db from "../index"
import { TerminalMetadata, Terminal } from "app/terminal/types"

const stationMetadata: TerminalMetadata & { ticketAddress: string } = {
  name: "Station",
  handle: "station",
  description: "Building the infrastructure to empower the next billion contributors in web3.",
  ticketAddress: "0xbe26ee78ba287e5c6a862258db9c5e7fe7538f56",
  pfpURL: "https://pbs.twimg.com/profile_images/1465787628553310211/DOMgJi5d_400x400.jpg",
}

const ccsMetadata: TerminalMetadata & { ticketAddress: string } = {
  name: "Crypto Culture & Society",
  handle: "CCS",
  description: "Liberal arts in web3.",
  ticketAddress: "0xd9243de6be84EA0f592D20e3E6ab67949D96bfe9",
  pfpURL: "https://pbs.twimg.com/profile_images/1458991184756494352/w5_kw214_400x400.jpg",
}

const fwbMetadata: TerminalMetadata & { ticketAddress: string } = {
  name: "Friends with Benefits",
  handle: "FWB",
  description: "The original social DAO.",
  ticketAddress: "0xd9243de6be812A0f592D20e3E6ab67949D96bfe9",
  pfpURL: "https://pbs.twimg.com/profile_images/1426752232133828609/GO240Kbh_400x400.jpg",
}

const krauseHouseMetadata: TerminalMetadata & { ticketAddress: string } = {
  name: "Krause House",
  handle: "krause_house",
  description: "WAGBABT",
  ticketAddress: "0xd924abe6be812A0f592D20e3E6ab67949D96bfe9",
  pfpURL: "https://pbs.twimg.com/profile_images/1451668831026491394/-HEQTtGz_400x400.png",
}

const edendaoMetadata: TerminalMetadata & { ticketAddress: string } = {
  name: "Eden Dao",
  handle: "TheEdenDao",
  description: "Decentralized reserve currency for the globe.",
  ticketAddress: "0xd9243de6be812A0f592D20e3E6ab67ab9D96bfe9",
  pfpURL: "https://pbs.twimg.com/profile_images/1452713855012982800/LPym3-an_400x400.jpg",
}

const terminalMap = {
  stationMetadata,
  ccsMetadata,
  fwbMetadata,
  krauseHouseMetadata,
  edendaoMetadata,
}

export async function seedTerminals() {
  let terminals = {}
  for (let terminalId in terminalMap) {
    let terminalMetadata = terminalMap[terminalId]
    let updatedTerminal = (await db.terminal.upsert({
      where: { ticketAddress: terminalMetadata.ticketAddress },
      create: {
        ticketAddress: terminalMetadata.ticketAddress,
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
