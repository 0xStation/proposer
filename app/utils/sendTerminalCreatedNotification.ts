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
        content: `New Station created: **${terminalName}**\nView: ${baseUrl}/station/${terminalHandle}/members`,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
