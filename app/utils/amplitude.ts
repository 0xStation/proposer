import * as Amplitude from "@amplitude/analytics-browser"

const trackerInit = () => Amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY as string)

export default trackerInit
