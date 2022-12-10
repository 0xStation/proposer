import { getAntiCSRFToken } from "@blitzjs/auth"
import { Proposal } from "app/proposal/types"
import { ProposalRoleType } from "@prisma/client"

export interface NotificationFromUserType {
  address: string
}

export interface NotificationType {
  type: string
  subscriberId: string
  payload: {
    from: NotificationFromUserType | string
    title: string
    note: string
    extra?: string
  }
}

export interface NewCommentNotificationType {
  from: NotificationFromUserType | "STATION"
  commentBody: string
}

export interface NewProposalNotificationType {
  recipient: string
  payload: {
    from: NotificationFromUserType | "STATION"
    proposalTitle: string
  }
}

export interface PaymentNotificationType {
  recipient: string
  payload: {
    from: NotificationFromUserType | "STATION"
    proposalTitle: string
    paymentAmount: number
    paymentToken: string
  }
}

export interface NewRFPSubmissionNotificationType {
  recipient: string
  payload: {
    from: NotificationFromUserType | "STATION"
    proposalTitle: string
    rfpTitle: string
  }
}

export interface ProposalApprovalNotificationType {
  recipient: string
  payload: {
    from: NotificationFromUserType | "STATION"
    proposalTitle: string
  }
}

export const useNotifications = () => {
  const fetcher = async (formData: NotificationType) => {
    await fetch("/api/novu/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anti-csrf": getAntiCSRFToken(),
      },
      body: JSON.stringify(formData),
    })
  }

  const getUnreadCount = async (subscriberId) => {
    try {
      const response = await fetch(`/api/novu/get-unread-count?subscriberId=${subscriberId}`, {
        method: "GET",
        headers: {
          "anti-csrf": getAntiCSRFToken(),
        },
      })
      const data = await response.json()
      return data.count
    } catch (e) {
      console.log(e)
    }
  }

  const markAsRead = async (subscriberId, notificationId) => {
    try {
      const response = await fetch(
        `/api/novu/mark-as-seen?subscriberId=${subscriberId}&notificationId=${notificationId}`,
        {
          method: "GET",
          headers: {
            "anti-csrf": getAntiCSRFToken(),
          },
        }
      )
      const data = await response.json()
      return data.count
    } catch (e) {
      console.error(e)
    }
  }

  const sendNewCommentNotification = async (
    proposal: Proposal,
    formData: NewCommentNotificationType
  ) => {
    const type = "new-comment"

    // There must be a way to validate this with typescript
    if (!proposal.roles) {
      console.log("throwing error")
      throw new Error("Proposal must include roles.")
    }

    // not sure how we want to determine who to send this to.
    // for now, let just do author, but we can rewrite this function
    // to send to all people on proposal if we want.
    const recipients = proposal.roles.filter((role) => {
      return role.type === ProposalRoleType.AUTHOR
    })

    console.log(recipients)

    for (let recipient of recipients) {
      const data = {
        type,
        subscriberId: recipient.address,
        payload: {
          from: formData.from,
          title: "Commented on your proposal",
          note: proposal.data.content.title,
          extra: formData.commentBody,
        },
      }

      console.log(data)

      await fetcher(data)
    }

    return true
  }

  const sendNewProposalNotification = async (formData: NewProposalNotificationType) => {
    const type = "new-proposal"

    const data = {
      type,
      subscriberId: formData.recipient,
      payload: {
        title: "Sent you a proposal",
        from: formData.payload.from,
        note: formData.payload.proposalTitle,
      },
    }

    fetcher(data)
  }

  const sendPaymentNotification = async (formData: PaymentNotificationType) => {
    const type = "paid"

    const data = {
      type,
      subscriberId: formData.recipient,
      payload: {
        title: `Paid you ${formData.payload.paymentAmount} ${formData.payload.paymentToken}`,
        from: formData.payload.from,
        note: formData.payload.proposalTitle,
      },
    }

    fetcher(data)
  }

  const sendNewRFPSubmissionNotification = async (formData: NewRFPSubmissionNotificationType) => {
    const type = "new-rfp-submission"

    const data = {
      type,
      subscriberId: formData.recipient,
      payload: {
        from: formData.payload.from,
        title: "Submitted a proposal to your RFP",
        note: `${formData.payload.rfpTitle} - ${formData.payload.proposalTitle}`,
      },
    }

    fetcher(data)
  }

  const sendProposalApprovalNotification = async (formData: NewProposalNotificationType) => {
    // maybe make these enums
    const type = "proposal-approved"

    const data = {
      type,
      subscriberId: formData.recipient,
      payload: {
        from: "STATION",
        title: `${formData.payload.proposalTitle} has been approved!`,
        note: formData.payload.proposalTitle,
      },
    }

    fetcher(data)
  }

  return {
    markAsRead,
    getUnreadCount,
    sendNewCommentNotification,
    sendNewProposalNotification,
    sendPaymentNotification,
    sendNewRFPSubmissionNotification,
    sendProposalApprovalNotification,
  }
}
