import MarbleWalletConnector, { SupportedNetworkType } from "@marblexyz/wagmi-connector"
import { requireEnv } from "./requireEnv"

export const marbleConnector = new MarbleWalletConnector({
  options: {
    // Custom connector options
    clientKey: process.env.NEXT_PUBLIC_MARBLE_CLIENT_KEY,
    config: {
      customConfig: {
        appName: "Station",
        style: {
          backgroundColor: "#000000",
          textColor: "white",
          border: "1px solid #F2EFEF",
          infoTextColor: "#F2EFEF",
          closeModalButtonColor: "#F2EFEF",
          primaryActionColor: "#AD72FF",
          primaryActionBorderColor: "#AD72FF",
          primaryActionColorHover: "#CFADFF",
          primaryActionColorActive: "#CFADFF",
          inputPlaceholderColor: "#F2EFEF",
          inputBorderColor: "#F2EFEF",
          inputTextColor: "#F2EFEF",
          inputBackgroundColor: "#000000",
          inputFocusBorderColor: "#AD72FF",
          inputErrorBorderColor: "#FF5650",
          primaryAccentColor: "#AD72FF",
          secondaryAccentColor: "#CFADFF",
        },
      },
    },
  },
})
