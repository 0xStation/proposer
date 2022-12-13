import { useMutation } from "@blitzjs/rpc"
import createAccount from "app/account/mutations/createAccount"
import { Spinner } from "app/core/components/Spinner"
import useStore from "app/core/hooks/useStore"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"
import { composeValidators, isEnsOrAddress, requiredField } from "app/utils/validators"
import { useState } from "react"
import { Field, Form } from "react-final-form"

export const AddRoleForm = ({ addAccount }) => {
  const [isAddingAccount, setIsAddingAccount] = useState<boolean>(false)
  const setToastState = useStore((state) => state.setToastState)
  const { resolveEnsAddress } = useResolveEnsAddress()

  const [createAccountMutation] = useMutation(createAccount, {
    onSuccess: (account) => {
      addAccount(account)
    },
    onError: (error) => {
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error adding account.",
      })
    },
    onSettled: () => {
      setIsAddingAccount(false)
    },
  })

  return (
    <Form
      initialValues={{}}
      onSubmit={async (values, form) => {
        setIsAddingAccount(true)

        const resolvedAddress = await resolveEnsAddress(values.address.trim())
        if (!resolvedAddress) {
          setIsAddingAccount(false)
          setToastState({
            isToastShowing: true,
            type: "error",
            message: "Invalid ENS name or wallet address provided.",
          })
          return
        }

        try {
          await createAccountMutation({
            address: resolvedAddress,
          })
          form.reset()
        } catch (e) {
          console.error(e)
        }
      }}
      render={({ form, handleSubmit }) => {
        const formState = form.getState()
        return (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-row items-center mt-8 space-x-2">
              <Field name="address" validate={composeValidators(requiredField, isEnsOrAddress)}>
                {({ meta, input }) => {
                  return (
                    <>
                      <input
                        {...input}
                        type="text"
                        required
                        placeholder="Enter ENS name or wallet address"
                        className="bg-wet-concrete rounded-md w-full p-2"
                        // className="bg-wet-concrete rounded-tl-md rounded-bl-md w-full p-2"
                      />
                      {/* TODO: acting weird with flex-row */}
                      {/* {meta.touched && meta.error && (
                          <span className="text-torch-red text-xs">{meta.error}</span>
                        )} */}
                    </>
                  )
                }}
              </Field>
              <button
                type="submit"
                disabled={formState.invalid || isAddingAccount}
                className="text-sm text-marble-white font-bold w-[120px] border border-marble-white bg-tunnel-black hover:bg-wet-concrete rounded-md h-10 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAddingAccount ? (
                  <div className="flex justify-center items-center">
                    <Spinner fill="white" />
                  </div>
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </form>
        )
      }}
    />
  )
}
