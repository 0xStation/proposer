import { invoke, invalidateQuery } from "blitz"
import addDiscordIdAndMergeAccount from "app/account/mutations/addDiscordIdAndMergeAccount"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import useDiscordAuthWithCallback from "../hooks/useDiscordAuthWithCallback"
import useStore from "../hooks/useStore"
import Modal from "./Modal"
import getAccountByDiscordId from "app/account/queries/getAccountByDiscordId"
import useLocalStorage from "../hooks/useLocalStorage"

export const ConnectDiscordProfileModal = ({ isOpen, setIsOpen, activeUser, setNewAuth }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [, setHasDismissedDiscordConnectModal] = useLocalStorage<boolean>(
    "has_dismissed_discord_connect_modal",
    false
  )

  const { callbackWithDCAuth, isAuthenticating, authorization } = useDiscordAuthWithCallback(
    "identify guilds",
    async (authorization) => {
      if (authorization) {
        setNewAuth(authorization)
        try {
          let response = await fetch(`${process.env.BLITZ_PUBLIC_API_ENDPOINT}/users/@me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authorization}`,
              "Content-Type": "application/json",
            },
          })

          if (response.status !== 200) {
            throw Error(`Error: status not 200 - returned ${response.status}`)
          }

          const data = await response.json()

          const account = await invoke(addDiscordIdAndMergeAccount, {
            accountId: activeUser?.id,
            discordId: data?.id,
          })

          setIsOpen(false)
          setToastState({
            isToastShowing: true,
            type: "success",
            message: "Your Station profile is now connected with your Discord account.",
          })

          invalidateQuery(getAccountByAddress)
          invalidateQuery(getAccountByDiscordId)

          return data
        } catch (err) {
          console.error(err)
          setToastState({
            isToastShowing: true,
            type: "error",
            message:
              "Connection didn't go through. Please try again by visiting your profile settings.",
          })
        }
      }
      return
    }
  )

  return (
    <Modal
      open={isOpen}
      toggle={() => {
        setIsOpen(!isOpen)
      }}
    >
      <div className="text-center">
        <h1 className="text-2xl m-7 text-center font-bold w-80 mx-auto">
          Connect your Station profile with Discord
        </h1>
        <p className="text-base mx-14 m-7 text-center">
          Connecting your Station profile with Discord to showcase your membership in communities on
          Station.
        </p>
        <button
          className="text-center bg-electric-violet text-tunnel-black rounded w-36 mx-auto py-1 mt-2 mb-3 hover:opacity-70"
          onClick={callbackWithDCAuth}
        >
          Connect
        </button>
        <button
          className="h-[32px] w-24 mx-auto ml-2 border border-electric-violet rounded-md text-electric-violet hover:bg-concrete"
          onClick={() => {
            setHasDismissedDiscordConnectModal(true)
            setIsOpen(!isOpen)
          }}
        >
          Not now
        </button>
      </div>
    </Modal>
  )
}

export default ConnectDiscordProfileModal
