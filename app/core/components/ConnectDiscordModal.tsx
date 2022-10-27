import { invoke, invalidateQuery } from "blitz"
import useDiscordAuthWithCallback from "../hooks/useDiscordAuthWithCallback"
import useStore from "../hooks/useStore"
import Modal from "./Modal"
import updateAccountWithoutEmail from "app/account/mutations/updateAccountWithoutEmail"
import Button from "./sds/buttons/Button"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { useEnsName } from "wagmi"

export const ConnectDiscordModal = ({ isOpen, setIsOpen }) => {
  const activeUser = useStore((state) => state.activeUser)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const setToastState = useStore((state) => state.setToastState)

  const { callbackWithDCAuth, isAuthenticating, authorization } = useDiscordAuthWithCallback(
    "identify guilds",
    async (authorization) => {
      if (authorization) {
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

          await invoke(updateAccountWithoutEmail, {
            address: activeUser?.address,
            discordId: user?.id,
            name: activeUser?.data?.name || user?.username,
            bio: activeUser?.data?.bio,
            pfpUrl:
              activeUser?.data?.pfpUrl ||
              `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
            discordHandle: user?.username + "#" + user?.discriminator,
          })

          invalidateQuery(getAccountByAddress)

          setIsOpen(false)
          setToastState({
            isToastShowing: true,
            type: "success",
            message: "Your Station and Discord accounts are now connected.",
          })

          // reset activeUser to update pfp
          const account = await invoke(getAccountByAddress, { address: activeUser?.address })

          setActiveUser(account)

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
      <div className="mt-8 px-2">
        <h1 className="text-2xl font-bold">Connect your Station workspace with Discord</h1>
        <p className="text-base mt-3">
          Connecting your Station profile with Discord to provides a means for individuals tied to
          your proposal to contact you.
        </p>
        <Button className="mt-8 mb-3" onClick={callbackWithDCAuth}>
          Connect
        </Button>
      </div>
    </Modal>
  )
}

export default ConnectDiscordModal
