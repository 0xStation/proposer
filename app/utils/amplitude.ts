import { isDev, isStaging } from "."
import { init, track, identify, Identify, setUserId } from "@amplitude/analytics-browser"
import { EVENT_TYPE } from "app/core/utils/constants"

const { CLICK, IMPRESSION, EVENT, ERROR } = EVENT_TYPE

type ClickProperties = {
  pageName: string
  stationName: string
  stationId: number
  wallet: string
  userAddress: string
  chainId: number
  quorum: number
  signers: string[]
  checkbookAddress: string
  checkbookName: string
  rfpId: string
  numRfps: number
  numProposals: number
  isEdit: boolean
  recipientAddress: string
  amount: string
  title: string
  proposalId: string
  numCheckbooks: number
  startDate: string
  endDate: string
}

type ImpressionProperties = {
  pageName: string
  stationName: string
  stationId: number
  userAddress: string
  numCheckbooks: number
  numRfps: number
  rfpId: string
  proposalId: string
}

type EventProperties = {
  pageName: string
  stationName: string
  stationId: number
  userAddress: string
  quorum: number
  signers: string[]
  checkbookName: string
  checkbookAddress: string
  rfpId: string
}

type ErrorProperties = {
  pageName: string
  stationName: string
  stationId: number
  userAddress: string
  description: string
  checkbookName: string
  signers: string[]
  quorum: number
  errorMsg: string
  rfpId: string
  startDate: string
  endDate: string
  recipientAddress: string
  amount: string
  title: string
  checkbookAddress: string
}

export const trackerInit = () => {
  if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
    init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY as string)
  }
}

export const initializeUser = (address: string) => {
  const identifyObj = new Identify()
  identify(identifyObj)
  setUserId(address)
}

export const trackClick = (eventName: string, metadata: Partial<ClickProperties>) => {
  if ((isDev() || isStaging()) && process.env.NEXT_PUBLIC_TRACK !== "true") {
    return
  }

  const {
    pageName,
    stationName,
    stationId,
    wallet,
    userAddress,
    chainId,
    quorum,
    signers,
    checkbookName,
    checkbookAddress,
    rfpId,
    numRfps,
    isEdit,
    recipientAddress,
    amount,
    title,
    numProposals,
    proposalId,
    numCheckbooks,
    startDate,
    endDate,
  } = metadata
  track(eventName, {
    event_category: CLICK,
    page: pageName,
    station_name: stationName,
    station_id: stationId,
    user_address: userAddress,
    wallet,
    chain_id: chainId,
    quorum,
    signers,
    checkbook_name: checkbookName,
    checkbook_address: checkbookAddress,
    rfp_id: rfpId,
    num_rfps: numRfps,
    num_proposals: numProposals,
    is_edit: isEdit,
    recipient_address: recipientAddress,
    amount,
    title,
    proposal_id: proposalId,
    num_checkbooks: numCheckbooks,
    start_date: startDate,
    end_date: endDate,
  })
}

export const trackImpression = (eventName: string, metadata: Partial<ImpressionProperties>) => {
  if ((isDev() || isStaging()) && !process.env.NEXT_PUBLIC_TRACK) {
    return
  }

  const {
    pageName,
    stationName,
    stationId,
    userAddress,
    numCheckbooks,
    numRfps,
    rfpId,
    proposalId,
  } = metadata

  track(eventName, {
    event_category: IMPRESSION,
    page: pageName,
    station_name: stationName,
    station_id: stationId,
    user_address: userAddress,
    num_checkbooks: numCheckbooks,
    num_rfps: numRfps,
    rfp_id: rfpId,
    proposal_id: proposalId,
  })
}

export const trackEvent = (
  eventName: string,
  eventCategory = EVENT,
  metadata: Partial<EventProperties>
) => {
  if ((isDev() || isStaging()) && !process.env.NEXT_PUBLIC_TRACK) {
    return
  }

  const {
    pageName,
    stationName,
    stationId,
    userAddress,
    quorum,
    signers,
    checkbookName,
    checkbookAddress,
    rfpId,
  } = metadata

  track(eventName, {
    event_category: eventCategory,
    page: pageName,
    station_name: stationName,
    station_id: stationId,
    user_address: userAddress,
    quorum,
    signers,
    checkbook_name: checkbookName,
    checkbook_address: checkbookAddress,
    rfp_id: rfpId,
  })
}

export const trackError = (eventName: string, metadata: Partial<ErrorProperties>) => {
  if ((isDev() || isStaging()) && !process.env.NEXT_PUBLIC_TRACK) {
    return
  }

  const {
    pageName,
    stationName,
    stationId,
    userAddress,
    description,
    checkbookName,
    signers,
    errorMsg,
    rfpId,
    startDate,
    endDate,
    quorum,
    recipientAddress,
    amount,
    title,
    checkbookAddress,
  } = metadata

  track(eventName, {
    event_category: ERROR,
    page: pageName,
    station_name: stationName,
    station_id: stationId,
    user_address: userAddress,
    description: description,
    checkbook_name: checkbookName,
    signers,
    quorum,
    error_msg: errorMsg,
    rfp_id: rfpId,
    start_date: startDate,
    end_date: endDate,
    recipient_address: recipientAddress,
    amount,
    title,
    checkbook_address: checkbookAddress,
  })
}

export default trackerInit
