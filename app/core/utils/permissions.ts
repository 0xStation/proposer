export const canEdit = (activeUser, terminalId, type) => {
  if (!activeUser) {
    return false
  }

  const ticket = activeUser.tickets.find((ticket) => ticket.terminalId === terminalId)

  if (!ticket) {
    return false
  }

  return !!ticket.terminal.data.permissions?.edit[type]?.includes(ticket.roleLocalId as number)
}
