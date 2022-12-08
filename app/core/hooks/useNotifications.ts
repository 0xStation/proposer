import { getAntiCSRFToken } from "@blitzjs/auth"

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
  recipient: string
  payload: {
    from: NotificationFromUserType | "STATION"
    proposalTitle: string
    commentBody: string
  }
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

  const sendNewCommentNotification = async (formData: NewCommentNotificationType) => {
    const type = "new-comment"

    const data = {
      type,
      subscriberId: formData.recipient,
      payload: {
        from: formData.payload.from,
        title: "Commented on your proposal",
        note: formData.payload.proposalTitle,
        extra: formData.payload.commentBody,
      },
    }

    fetcher(data)
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
    sendNewCommentNotification,
    sendNewProposalNotification,
    sendPaymentNotification,
    sendNewRFPSubmissionNotification,
    sendProposalApprovalNotification,
  }
}
