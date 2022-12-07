import { getAntiCSRFToken } from "@blitzjs/auth"

export interface NewCommentNotificationType {
  recipient: string
  payload: {
    comment_body: string
  }
}

export const useNotifications = () => {
  const fetcher = async (formData: any) => {
    await fetch("/api/novu/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anti-csrf": getAntiCSRFToken(),
      },
      body: JSON.stringify(formData),
    })
  }

  const sendNewCommentNotification = async (formData: NewCommentNotificationType) => {
    const type = "new-comment"

    const data = {
      type,
      subscriberId: formData.recipient,
      payload: formData.payload,
    }
    fetcher(data)
  }

  return {
    sendNewCommentNotification,
  }
}
