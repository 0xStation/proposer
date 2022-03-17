export const canEdit = (activeUser, terminalId) => {
  const ticket = activeUser.tickets.find((ticket) => ticket.terminalId === terminalId)

  if (!ticket) {
    return false
  }

  return !!ticket.terminal.data.permissions?.edit[ticket.roleLocalId as number]
}
