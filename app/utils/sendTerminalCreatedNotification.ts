export async function sendTerminalCreationNotification(
  terminalName: string,
  terminalHandle: string,
  baseUrl: string,
  discordWebhookUrl?: string
) {
  if (discordWebhookUrl) {
    await fetch(discordWebhookUrl, {
      method: "POST",
      body: JSON.stringify({
        content: `New Terminal created: **${terminalName}**\nView: ${baseUrl}/station/${terminalHandle}/members`,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
