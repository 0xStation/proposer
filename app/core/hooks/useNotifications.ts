import { getAntiCSRFToken } from "@blitzjs/auth"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { ProposalPayment } from "app/proposalPayment/types"
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

export type NewCommentNotificationType = {
  from: NotificationFromUserType
  commentBody: string
}

export type NewProposalNotificationType = {
  from: NotificationFromUserType
}

export type NewRFPSubmissionNotificationType = {
  from: NotificationFromUserType
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
    // ProposalWithRoles type?
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

      await fetcher(data)
    }

    return true
  }

  const sendNewProposalNotification = async (
    proposal: Proposal,
    formData: NewProposalNotificationType
  ) => {
    const type = "new-proposal"

    if (!proposal.roles) {
      console.log("throwing error")
      throw new Error("Proposal must include roles.")
    }

    const recipients = proposal.roles.filter((role) => {
      return role.type !== ProposalRoleType.AUTHOR
    })

    for (let recipient of recipients) {
      const data = {
        type,
        subscriberId: recipient.address,
        payload: {
          title: "Sent you a proposal",
          from: formData.from,
          note: proposal.data.content.title,
        },
      }

      await fetcher(data)
    }

    return true
  }

  const sendPaymentNotification = async (payment: ProposalPayment, proposal: Proposal) => {
    const type = "paid"

    const recipient = payment.recipientAddress
    const from = payment.senderAddress

    const data = {
      type,
      subscriberId: recipient,
      payload: {
        title: `Paid you ${payment.amount} ${payment.data.token.symbol}`,
        from: from,
        note: proposal.data.content.title,
      },
    }

    await fetcher(data)
    return true
  }

  const sendNewRFPSubmissionNotification = async (
    rfp: Rfp,
    proposal: Proposal,
    formData: NewRFPSubmissionNotificationType
  ) => {
    const type = "new-rfp-submission"
    const recipient = rfp.accountAddress

    const data = {
      type,
      subscriberId: recipient,
      payload: {
        from: formData.from,
        title: "Submitted a proposal to your RFP",
        note: `${rfp.data.content.title} - ${proposal.data.content.title}`,
      },
    }

    await fetcher(data)
    return true
  }

  const sendProposalApprovalNotification = async (proposal) => {
    // maybe make these enums
    const type = "proposal-approved"

    // figured the author and contributor would be most interested?
    // we can easily update this though, if it differs
    const recipients = proposal.roles.filter((role) => {
      return role.type !== ProposalRoleType.CLIENT
    })

    for (let recipient of recipients) {
      const data = {
        type,
        subscriberId: recipient,
        payload: {
          from: "STATION",
          title: `${proposal.data.content.title} has been approved!`,
          note: proposal.data.content.title,
        },
      }

      await fetcher(data)
    }

    return true
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
