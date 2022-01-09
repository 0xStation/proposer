import db from "../index"
import { TerminalMetadata } from "app/terminal/types"

export const stationMetadata: TerminalMetadata = {
  name: "Station",
  handle: "station",
  description: "Building the infrastructure to empower the next billion contributors in web3.",
}

export async function seedTerminals() {
  let station = await db.terminal.upsert({
    where: { ticketAddress: "0xd9243de6be84EA0f592D20e3E6bd67949D96bfe9" },
    create: {
      ticketAddress: "0xd9243de6be84EA0f592D20e3E6bd67949D96bfe9",
      data: stationMetadata,
    },
    update: {
      data: stationMetadata,
    },
  })
  return {
    station,
  }
}
