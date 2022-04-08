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
