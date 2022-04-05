import { genBaseUrl } from "../utils"

export async function sendNewApplicationNotification(
  initiativeName: string,
  userName: string,
  userAddress: string,
  discordWebhookUrl?: string
) {
  if (discordWebhookUrl) {
    await fetch(discordWebhookUrl, {
      method: "POST",
      body: JSON.stringify({
        content: `New interest submission for **${initiativeName}** from ${userName}\nView profile: https://${genBaseUrl()}/profile/${userAddress}`,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
