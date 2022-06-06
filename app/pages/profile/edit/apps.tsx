import {
  BlitzPage,
  InferGetServerSidePropsType,
  GetServerSideProps,
  getSession,
  invoke,
  Routes,
  Image,
  invalidateQuery,
} from "blitz"
import { Fragment, useState } from "react"
import EditNavigation from "app/profile/components/settings/Navigation"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import DiscordIcon from "public/discord-icon.svg"
import Exit from "public/exit-button.svg"
import CheckmarkIcon from "public/checkmark-icon.svg"
import useDiscordAuthWithCallback from "app/core/hooks/useDiscordAuthWithCallback"
import addDiscordIdAndMergeAccount from "app/account/mutations/addDiscordIdAndMergeAccount"
import useStore from "app/core/hooks/useStore"
import useLocalStorage from "app/core/hooks/useLocalStorage"
import { Auth } from "app/auth/types"
import NoSsr from "app/core/components/NoSsr"
import { Dialog, Transition } from "@headlessui/react"

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res)

  const user = await invoke(getAccountByAddress, { address: session?.siwe?.address })

  if (!session?.siwe?.address) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  if (!user) {
    return {
      redirect: {
        destination: Routes.CreateProfile(),
        permanent: false,
      },
    }
  }

  return {
    props: {
      activeUser: user,
    }, // will be passed to the page component as props
  }
}

const LIST_OF_SUPPORTED_APPS_METADATA = [
  {
    name: "Discord",
    icon: DiscordIcon,
  },
]

const EditProfileApps: BlitzPage = ({
  activeUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [selectedAppName, setSelectedAppName] = useState<string>("Discord")
  const [mobileSelectedAppDrawerIsOpen, setMobileSelectedAppDrawerIsOpen] = useState<boolean>(false)

  return (
    <EditNavigation activeUser={activeUser}>
      <div>
        <div className="p-6 border-b border-concrete flex justify-between">
          <h2 className="text-marble-white text-2xl font-bold">Apps</h2>
        </div>
        <div className="grid grid-cols-7 h-full w-full">
          <div className="overflow-y-auto col-span-7 sm:col-span-4">
            {LIST_OF_SUPPORTED_APPS_METADATA &&
              LIST_OF_SUPPORTED_APPS_METADATA.map((app, idx) => (
                <AppComponent
                  app={app}
                  selectedAppName={selectedAppName}
                  setSelectedAppName={setSelectedAppName}
                  key={app.name + idx}
                  setMobileSelectedAppDrawerIsOpen={setMobileSelectedAppDrawerIsOpen}
                />
              ))}
          </div>
          {selectedAppName && activeUser && (
            <>
              <div className="h-screen border-l border-concrete col-span-3 flex-col hidden sm:flex">
                <SelectedAppCard appName={selectedAppName} activeUser={activeUser} />
              </div>
              <Transition.Root show={mobileSelectedAppDrawerIsOpen} as={Fragment}>
                <Dialog
                  as="div"
                  className="fixed inset-0 overflow-hidden block sm:hidden"
                  onClose={setMobileSelectedAppDrawerIsOpen}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-500"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-500"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Dialog.Overlay className="absolute inset-0 bg-tunnel-black bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                      <Transition.Child
                        as={Fragment}
                        enter="transform transition ease-in-out duration-500 sm:duration-700"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-500 sm:duration-700"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                      >
                        <div className="pointer-events-auto w-screen max-w-xs">
                          <div className="flex h-full flex-col overflow-y-scroll bg-tunnel-black border-l border-concrete">
                            <div className="px-4">
                              <>
                                <div className="flex items-start justify-between w-full">
                                  <div className="flex justify-between h-7 items-center w-full">
                                    <button
                                      className="mt-4 mr-4 text-right"
                                      onClick={() => setMobileSelectedAppDrawerIsOpen(false)}
                                    >
                                      <Image src={Exit} alt="Close button" width={12} height={12} />
                                    </button>
                                  </div>
                                  <Dialog.Title className="text-lg font-medium text-marble-white"></Dialog.Title>
                                </div>
                              </>
                            </div>
                            <SelectedAppCard appName={selectedAppName} activeUser={activeUser} />
                          </div>
                        </div>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition.Root>
            </>
          )}
        </div>
      </div>
    </EditNavigation>
  )
}

const AppComponent = ({
  app,
  selectedAppName,
  setSelectedAppName,
  setMobileSelectedAppDrawerIsOpen,
}) => {
  return (
    <div
      tabIndex={0}
      className={`flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer ${
        app.name === selectedAppName ? "bg-wet-concrete" : ""
      }`}
      onClick={() => {
        setSelectedAppName(app.name)
        setMobileSelectedAppDrawerIsOpen(true)
      }}
    >
      <div className="flex space-x-2">
        <div className="flex flex-col content-center align-middle mr-3">
          <Image src={app.icon} height={26} width={26} />
        </div>
        <div className="flex flex-col content-center">
          <div className="flex flex-row items-center space-x-1">
            <p className="text-xl text-marble-white font-bold">{app.name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const SelectedAppCard = ({ appName, activeUser }) => {
  switch (appName) {
    case "Discord":
      return <DiscordAppCard activeUser={activeUser} />
    default:
      return null
  }
}

export const DiscordAppCard = ({ activeUser }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [discordAuthToken] = useLocalStorage<Auth | undefined>(
    "dc_auth_identify guilds",
    undefined,
    false
  )

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

          const data = await response.json()

          await invoke(addDiscordIdAndMergeAccount, {
            accountId: activeUser?.id,
            discordId: data?.id,
          })

          setToastState({
            isToastShowing: true,
            type: "success",
            message: "Your Station profile is now connected with your Discord account.",
          })

          invalidateQuery(getAccountByAddress)

          return data
        } catch (err) {
          console.error(err)
          setToastState({
            isToastShowing: true,
            type: "error",
            message: "Connection didn't go through. Please try again refreshing the page.",
          })
        }
      }
      return
    }
  )

  return (
    <NoSsr>
      <div className="mt-5 ml-5">
        <div className="inline mr-2 align-middle">
          <Image src={DiscordIcon} height={26} width={26} />
        </div>
        <p className="inline font-bold text-xl">Discord</p>
      </div>
      <div className="ml-5 mr-8">
        <p className="uppercase tracking-wider text-xs mt-8">About the app</p>
        <p className="mt-3 mr-8">
          Discord is a VoIP, instant messaging and digital distribution platform. Users have the
          ability to communicate with voice calls, video calls, text messaging, media and files in
          private chats or as part of communities called &quot;servers.&quot;
        </p>
      </div>
      <div className="ml-5 mt-6 mr-8">
        <p className="uppercase tracking-wider text-xs">Permissions</p>
        <ul>
          <li className="mt-3">
            <div className="inline align-middle mr-3">
              <Image src={CheckmarkIcon} height={18} width={18} />
            </div>
            <p className="inline">Access your username and avatar</p>
          </li>
          <li className="mt-3">
            <div className="inline align-middle mr-3">
              <Image src={CheckmarkIcon} height={18} width={18} />
            </div>
            <p className="inline">Know what servers you’re in</p>
          </li>
        </ul>
      </div>
      <div className="text-center mt-auto mb-28">
        <button
          className={`h-[35px] border border-marble-white w-[198px] rounded cursor-pointer ${
            authorization || discordAuthToken ? "opacity-70" : "hover:bg-concrete"
          }`}
          onClick={callbackWithDCAuth}
          disabled={!!(authorization || discordAuthToken)}
        >
          {authorization || discordAuthToken ? "Connected" : "Connect"}
        </button>
      </div>
    </NoSsr>
  )
}

EditProfileApps.suppressFirstRenderFlicker = true
EditProfileApps.getLayout = (page) => (
  <LayoutWithoutNavigation title="Edit Profile">{page}</LayoutWithoutNavigation>
)

export default EditProfileApps
