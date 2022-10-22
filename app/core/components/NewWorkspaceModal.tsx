import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation, invoke } from "@blitzjs/rpc"
import { useEffect, useState } from "react"
import Modal from "./sds/overlays/modal"
import Select from "./form/Select"
import Button from "./sds/buttons/Button"
import { Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import createSafe from "app/account/mutations/createSafe"
import { Account } from "app/account/types"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import networks from "app/utils/networks.json"
import TextLink from "./TextLink"
import { LINKS } from "../utils/constants"

export const NewWorkspaceModal = ({
  isOpen,
  setIsOpen,
  activeUser,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  activeUser: Account
}) => {
  const activeChain = useStore((state) => state.activeChain) || { id: 1 }
  const setToastState = useStore((state) => state.setToastState)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const [safes, setSafes] = useState<string[]>([])
  const router = useRouter()

  const [createSafeMutation, { isLoading }] = useMutation(createSafe, {
    onSuccess: async (data) => {
      setIsOpen(false)
      const safeAddress = data.address as string
      const account = await invoke(getAccountByAddress, { address: activeUser.address })
      setActiveUser(account)
      router.push(Routes.WorkspaceHome({ accountAddress: safeAddress }))
    },
    onError: (_error) => {
      // mutation is upsert and shouldn't throw, not sure why an error would happen
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error occurred, please try again.",
      })
    },
  })

  useEffect(() => {
    // get multisigs for user
    const fetchSafes = async (address: string) => {
      const network = networks[activeChain.id]?.gnosisNetwork
      const url = `https://safe-transaction.${network}.gnosis.io/api/v1/owners/${toChecksumAddress(
        address
      )}/safes`
      const response = await fetch(url)
      const data = await response.json()
      const safes = data.safes
      setSafes(
        safes.map((safe) => {
          return { value: safe, label: safe }
        })
      )
    }
    if (activeUser?.address) {
      fetchSafes(activeUser.address)
    }
  }, [activeUser, activeChain])

  return (
    <Modal
      open={isOpen}
      toggle={() => {
        setIsOpen(!isOpen)
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Create a new workspace</h1>
        <p className="text-base mt-6">
          Select a <TextLink url={LINKS.GNOSIS_SAFE}>Gnosis Safe </TextLink>
          address that you would like to govern the workspace. If you are looking to create a
          workspace with another personal wallet, connect your wallet to a new address and sign in
          again.
        </p>
        <Form
          initialValues={{}}
          onSubmit={(values) => {
            try {
              createSafeMutation({
                address: values.safeAddress.value,
                chainId: activeChain.id,
              })
            } catch (e) {
              console.error(e)
              setToastState({
                isToastShowing: true,
                type: "error",
                message: "Something went wrong importing this safe.",
              })
            }
          }}
          render={({ form, handleSubmit }) => {
            const formState = form.getState()
            return (
              <form onSubmit={handleSubmit}>
                <label className="font-bold block mt-6">Gnosis Safe address*</label>
                <span className="text-xs text-light-concrete block mb-2">
                  Listed options are the Gnosis Safes that you are a current admin of on the
                  selected network. Change your network in the upper-right corner of this page to
                  the left of your profile.
                </span>
                <Select name="safeAddress" options={safes} placeholder="Select one" />
                <div className="mt-6 flex justify-end">
                  <div className="flex flex-col">
                    <Button
                      isSubmitType={true}
                      isLoading={isLoading}
                      isDisabled={!formState.values?.safeAddress}
                      className="block self-end"
                    >
                      Create
                    </Button>
                    {!formState.values?.safeAddress && (
                      <span className="text-xs mt-2">
                        You can continue once you&apos;ve selected an option.
                      </span>
                    )}
                  </div>
                </div>
              </form>
            )
          }}
        />
      </div>
    </Modal>
  )
}

export default NewWorkspaceModal
