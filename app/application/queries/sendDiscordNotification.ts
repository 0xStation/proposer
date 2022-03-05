const SendDiscordNotification = async (terminalHandle, webhook, initiative, applicant) => {
  const discordURL = webhook

  const notification = {
    content: `New Application Submitted to ${terminalHandle.toUpperCase()}`,
    // embeds: [
    //   {
    //     title: `${applicant?.data.name} just applied to ${initiative?.data.name.toUpperCase()}`,
    //     description: `https://station.express/terminal/${terminalHandle}/waiting-room`,
    //   },
    // ],
  }
  if (discordURL !== undefined) {
    fetch(discordURL, {
      method: "POST",
      body: JSON.stringify(notification),
      headers: {
        "Content-Type": "application/json",
      },
    })
    console.log("fetch has returned")
  }
}

export default SendDiscordNotification
