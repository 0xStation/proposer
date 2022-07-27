export const canEdit = (activeUser, terminalId, type) => {
  if (!activeUser) {
    return false
  }

  if (activeUser.data.isAdmin) {
    return true
  }

  const ticket = activeUser.tickets.find((ticket) => ticket.terminalId === terminalId)

  if (!ticket) {
    return false
  }

  const editPerms = ticket.terminal.data.permissions?.edit
  return !!(editPerms ? editPerms[type]?.includes(ticket.roleLocalId as number) : false)
}

const createStationWhitelist = [
  "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  "0x016562aA41A8697720ce0943F003141f5dEAe006",
  "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
]
export const canCreateStation = (address: string | undefined) => {
  if (!address) return false
  const lowercaseAddress = address.toLowerCase()
  return createStationWhitelist.some((address) => address.toLowerCase() === lowercaseAddress)
}
