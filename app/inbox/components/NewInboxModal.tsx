import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation, invoke, invalidateQuery } from "@blitzjs/rpc"
import { useEffect, useState } from "react"
import Modal from "app/core/components/sds/overlays/modal"
import Button from "app/core/components/sds/buttons/Button"
import { Form, Field } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import createInbox from "app/inbox/mutations/createInbox"
import { Account } from "app/account/types"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import networks from "app/utils/networks.json"
import SelectSafeField from "app/core/components/form/SelectSafeField"
import { Safe } from "app/safe/types"
import { TextField } from "app/core/components/form/TextField"
import { composeValidators, isAddress, requiredField } from "app/utils/validators"
import { Checkbook } from "app/checkbook/types"
import TextareaFieldOrMarkdownPreview from "app/core/components/TextareaFieldOrMarkdownPreview"
import TextareaField from "app/core/components/form/TextareaField"
import getInboxes from "../queries/getInboxes"

export const NewInboxModal = ({
  isOpen,
  setIsOpen,
  checkbook,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  checkbook: Checkbook
}) => {
  const setToastState = useStore((state) => state.setToastState)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [createInboxMutation] = useMutation(createInbox, {
    onSuccess: async (inbox) => {
      setIsOpen(false)
      invalidateQuery(getInboxes)
    },
    onError: (_error) => {
      // mutation is upsert and shouldn't throw, not sure why an error would happen
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error occurred, please try again.",
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  return (
    <Modal
      open={isOpen}
      toggle={() => {
        setIsOpen(!isOpen)
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Create an Inbox</h1>
        <p className="mt-4">
          Inboxes are folders to organize inbound requests from your team and community. Inboxes
          only support ETH and ERC20 transfers at the moment.
        </p>
        <Form
          initialValues={{}}
          onSubmit={async (values) => {
            setIsLoading(true)

            try {
              createInboxMutation({
                chainId: checkbook.chainId,
                address: checkbook.address,
                name: values.name,
                notes: values.notes,
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
                <TextField title="Name*" fieldName="name" placeholder="Enter name for this inbox" />
                <TextareaField
                  title="Notes*"
                  fieldName="notes"
                  placeholder="Enter notes to share with requesters"
                />
                <div className="mt-6 flex justify-end">
                  <div className="flex flex-col">
                    <Button
                      isSubmitType={true}
                      isLoading={isLoading}
                      isDisabled={formState.invalid}
                      className="block self-end"
                    >
                      Create
                    </Button>
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

export default NewInboxModal
