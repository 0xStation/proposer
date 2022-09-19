import { useEffect, useState } from "react"
import { useMutation, useRouter, Routes, invoke } from "blitz"
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
      // most likely the error?
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Workspace already exists for this address.",
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
        <h1 className="text-2xl font-bold">New workspace</h1>
        <p className="text-base mt-6">
          Select a multi-sig address that you would like to govern the workspace. The admins of the
          selected multi-sig will be the default admins of the workspace.
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
                <label className="font-bold block mt-6">Multi-sig address*</label>
                <span className="text-xs text-light-concrete block mb-2">
                  Options displayed are the multi-sig addresses that you’re a current admin of and
                  doesn’t govern any existing workspace.
                </span>
                <Select
                  name="safeAddress"
                  options={[...safes, ...safes, ...safes]}
                  placeholder="Select one"
                />
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
