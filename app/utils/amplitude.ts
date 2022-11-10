import { isDev, isStaging } from "."
import { init, track, identify, Identify, setUserId } from "@amplitude/analytics-browser"
import { EVENT_TYPE } from "app/core/utils/constants"

const { CLICK, IMPRESSION, EVENT, ERROR } = EVENT_TYPE

type ClickProperties = {
  pageName: string
  wallet: string
  userAddress: string
  chainId: number
}

type ImpressionProperties = {
  pageName: string
  userAddress: string
}

type EventProperties = {
  pageName: string
  userAddress: string
}

type ErrorProperties = {
  pageName: string
  userAddress: string
  errorMsg: string
}

const inactiveTracking = (isDev() || isStaging()) && process.env.NEXT_PUBLIC_TRACK !== "true"

export const trackerInit = () => {
  if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
    init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY as string)
  }
}

export const initializeUser = (address: string) => {
  if (inactiveTracking) {
    return
  }
  const identifyObj = new Identify()
  identify(identifyObj)
  setUserId(address)
}

export const trackClick = (eventName: string, metadata: Partial<ClickProperties>) => {
  if (inactiveTracking) {
    return
  }

  const { pageName, userAddress, wallet, chainId } = metadata
  track(eventName, {
    event_category: CLICK,
    page: pageName,
    user_address: userAddress,
    wallet,
  })
}

export const trackImpression = (eventName: string, metadata: Partial<ImpressionProperties>) => {
  if (inactiveTracking) {
    return
  }

  const { pageName, userAddress } = metadata

  track(eventName, {
    event_category: IMPRESSION,
    page: pageName,
    user_address: userAddress,
  })
}

export const trackEvent = (eventName: string, metadata: Partial<EventProperties>) => {
  if (inactiveTracking) {
    return
  }

  const { pageName, userAddress } = metadata

  track(eventName, {
    event_category: EVENT,
    page: pageName,
    user_address: userAddress,
  })
}

export const trackError = (eventName: string, metadata: Partial<ErrorProperties>) => {
  if (inactiveTracking) {
    return
  }

  const { pageName, userAddress, errorMsg } = metadata

  track(eventName, {
    event_category: ERROR,
    page: pageName,
    user_address: userAddress,
    error_msg: errorMsg,
  })
}

export default trackerInit
