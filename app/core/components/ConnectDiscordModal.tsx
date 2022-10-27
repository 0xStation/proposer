import { invoke, invalidateQuery } from "blitz"
import useDiscordAuthWithCallback from "../hooks/useDiscordAuthWithCallback"
import useStore from "../hooks/useStore"
import Modal from "./Modal"
import useLocalStorage from "../hooks/useLocalStorage"
import updateAccountWithoutEmail from "app/account/mutations/updateAccountWithoutEmail"

export const ConnectDiscordProfileModal = ({ isOpen, setIsOpen, setNewAuth }) => {
  const activeUser = useStore((state) => state.activeUser)
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

          const user = await response.json()

          const account = await invoke(updateAccountWithoutEmail, {
            address: activeUser?.address,
            discordId: user?.id,
            name: activeUser?.data?.name,
            bio: activeUser?.data?.bio,
            pfpUrl:
              activeUser?.data?.pfpUrl ||
              `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
            discordHandle: user?.username + "#" + user?.discriminator,
          })

          setIsOpen(false)
          setToastState({
            isToastShowing: true,
            type: "success",
            message: "Your Station and Discord accounts are now connected.",
          })

          return user
        } catch (err) {
          console.error(err)
          setToastState({
            isToastShowing: true,
            type: "error",
            message:
              "Connection didn't go through. Please try again by visiting your workspace settings.",
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
