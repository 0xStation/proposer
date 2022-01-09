import db from "../index"
import { TerminalMetadata } from "app/terminal/types"

const stationMetadata: TerminalMetadata & { ticketAddress: string } = {
  name: "Station",
  handle: "station",
  description: "Building the infrastructure to empower the next billion contributors in web3.",
  ticketAddress: "0xd9243de6be84EA0f592D20e3E6bd67949D96bfe9",
}

export async function seedTerminals() {
  const station = await db.terminal.upsert({
    where: { ticketAddress: stationMetadata.ticketAddress },
    create: {
      ticketAddress: stationMetadata.ticketAddress,
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
