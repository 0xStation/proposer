import { invoke, invalidateQuery } from "blitz"
import addDiscordIdAndMergeAccount from "app/account/mutations/addDiscordIdAndMergeAccount"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import useDiscordAuthWithCallback from "../hooks/useDiscordAuthWithCallback"
import useStore from "../hooks/useStore"
import Modal from "./Modal"

export const ConnectDiscordProfileModal = ({ isOpen, setIsOpen, activeUser, setNewAuth }) => {
  const setToastState = useStore((state) => state.setToastState)
  // identify, email, guilds, guilds.join
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
            message: "Your Station profile is now connected with your Discord Account.",
          })

          invalidateQuery(getAccountByAddress)

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
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="text-center">
        <h1 className="text-2xl m-7 text-center font-bold w-80 mx-auto">
          Connect your Station profile with Discord
        </h1>
        <p className="text-base mx-14 m-7 text-center">
          Connecting your Station profile with Discord to showcase your membership in communities on
          Station.
        </p>
        <button
          className="text-center border border-marble-white rounded w-96 mx-auto py-1 mb-3 hover:bg-wet-concrete"
          onClick={callbackWithDCAuth}
        >
          Connect with Discord
        </button>
      </div>
    </Modal>
  )
}

export default ConnectDiscordProfileModal
