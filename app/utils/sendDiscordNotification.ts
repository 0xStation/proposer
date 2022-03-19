export async function sendNewApplicationNotification(
  terminalHandle: string,
  initiativeName: string,
  userName: string,
  discordWebhookUrl?: string
) {
  if (discordWebhookUrl) {
    await fetch(discordWebhookUrl, {
      method: "POST",
      body: JSON.stringify({
        content: `New interest submission for **${initiativeName}** from: ${userName}\nhttps://station.express/terminal/${terminalHandle}/waiting-room`,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
