const axios = require("axios")

// Script to send the Station Notification bot introduction message.
// Requires a `discordWebhookUrl` variable which you get from a partner within their own Discord server.
export default async function seed() {
  const discordWebhookUrl = ""
  if (discordWebhookUrl == "") throw Error("must set discordWebhookUrl variable")
  await axios({
    method: "post",
    url: discordWebhookUrl,
    data: {
      content: `Hello world, Station Notification bot at your service! I am here to alert you to new interest submissions for your initiatives hosted on Station. If you have more feature requests that you'd like to see, please friend & message **symmetry#0069** for the time being. Catch you in the pluriverse :bullettrain_side::globe_with_meridians::sparkles:...`,
    },
  })
}
