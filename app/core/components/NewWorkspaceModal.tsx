import { useEffect, useState } from "react"
import { useMutation, useRouter, Routes } from "blitz"
import Modal from "./sds/overlays/modal"
import Select from "./form/Select"
import Button from "./sds/buttons/Button"
import { Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import createAccount from "app/account/mutations/createAccount"

const gnosisUrlForChain = {
  1: "https://safe-transaction.gnosis.io",
  4: "https://safe-transaction.rinkeby.gnosis.io",
  5: "https://safe-transaction.goerli.gnosis.io",
}

export const NewWorkspaceModal = ({ isOpen, setIsOpen }) => {
  const activeUser = useStore((state) => state.activeUser)
  const activeChain = useStore((state) => state.activeChain) || { id: 1 }
  const setToastState = useStore((state) => state.setToastState)
  const [safes, setSafes] = useState<string[]>([])
  const router = useRouter()

  const [createAccountMutation, { isLoading }] = useMutation(createAccount, {
    onSuccess: (data) => {
      setIsOpen(false)
      const safeAddress = data.address as string
      router.push(Routes.WorkspaceHome({ accountAddress: safeAddress }))
    },
    onError: (error) => {
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
      const gnosisApiUrl = gnosisUrlForChain[activeChain.id]
      const response = await fetch(`${gnosisApiUrl}/api/v1/owners/${address}/safes`)
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
  }, [activeUser])

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
            createAccountMutation({
              address: values.safeAddress.value,
            })
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
