import { useState } from "react"
import { Form, Field } from "react-final-form"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { AddressField } from "app/core/components/form/AddressField"
import { useParam } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import createCheck from "../mutations/createCheck"
import { prepareCustomTransaction } from "app/transaction/custom"
import { prepareMultiTransaction } from "app/transaction/multi"
import { TextField } from "app/core/components/form/TextField"
import { OptionalTextField } from "app/core/components/form/OptionalTextField"
import { CheckType } from "../types"
import CreateTxWizard from "app/transaction/components/CreateTxWizard"
import { Transaction } from "app/transaction/types"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"

export const NewCheckWizardForm = ({ goBack, onCreate }) => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txBuilderShowing, setTxBuilderShowing] = useState<boolean>(false)
  const { resolveEnsAddress } = useResolveEnsAddress()

  const [createCheckMutation, { isLoading }] = useMutation(createCheck, {
    onSuccess: (check) => {
      console.log("check", check)
      onCreate()
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <>
      <h1 className="text-2xl font-bold">Custom contract call</h1>
      <Form
        initialValues={{}}
        onSubmit={async (values, form) => {
          if (transactions.length === 1) {
            const singleTx = transactions[0]
            const target = await resolveEnsAddress(singleTx!.target.trim())
            const { operation, to, data, value } = prepareCustomTransaction(
              target || singleTx!.target,
              singleTx!.function,
              singleTx!.args,
              singleTx!.value
            )
            createCheckMutation({
              chainId: checkbookChainId,
              address: checkbookAddress,
              title: values.title,
              to,
              value,
              data,
              operation,
              meta: {
                type: CheckType.CustomCall,
              },
            })
          } else {
            const { operation, to, value, data } = prepareMultiTransaction(
              checkbookChainId,
              transactions
            )

            createCheckMutation({
              chainId: checkbookChainId,
              address: checkbookAddress,
              title: values.title,
              to,
              value,
              data,
              operation,
              meta: {
                type: CheckType.CustomCall,
              },
            })
          }
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <form onSubmit={handleSubmit}>
              <TextField
                title="Title*"
                fieldName="title"
                placeholder="Enter a few words for accounting"
              />
              {transactions.map((tx, idx) => {
                return (
                  <div key={idx} className="flex flex-col bg-light-concrete p-2 rounded mt-4">
                    <span>Target: {tx.target}</span>
                    <span>Fuction: {tx.function}</span>
                    <span>Value: {tx.value}</span>
                    {/* TODO: clean args */}
                    <span>Args: {tx.args}</span>
                    <button
                      onClick={() => {
                        const temp = [...transactions]
                        temp.splice(idx, 1)
                        setTransactions(temp)
                      }}
                    >
                      remove me
                    </button>
                  </div>
                )
              })}

              {txBuilderShowing ? (
                <div className="border p-4 rounded mt-8 relative">
                  <h4>Transaction Builder</h4>
                  <CreateTxWizard
                    initialValues={{}}
                    onSubmit={(values) => {
                      setTransactions([...transactions, values])
                      setTxBuilderShowing(false)
                    }}
                    onCancel={() => {
                      setTxBuilderShowing(false)
                    }}
                  >
                    <CreateTxWizard.Page>
                      {/* TARGET */}
                      <AddressField title="Target*" fieldName={`target`} />
                    </CreateTxWizard.Page>
                    <CreateTxWizard.Page>
                      {/* ABI */}
                      {/* Function */}
                      <OptionalTextField
                        title="Function"
                        fieldName={`function`}
                        placeholder="function"
                      />
                    </CreateTxWizard.Page>
                    <CreateTxWizard.Page>
                      <Field
                        name={"function"}
                        subscription={{ value: true }}
                        render={({ input, meta }) => {
                          const fn = input.value
                          const args = fn
                            ?.split(/[(,)]/)
                            .filter((el) => el.trim().length && !el.includes("function"))
                            .map((el) => el.trim())
                          return (
                            <>
                              {args?.map((arg, idx) => {
                                const [type, name] = arg.split(" ")
                                return (
                                  <OptionalTextField
                                    key={`argsField-${idx}`}
                                    title={`${name} (${type})`}
                                    fieldName={`args[${idx}]`}
                                    placeholder="argument value"
                                  />
                                )
                              })}
                              {args.length === 0 && (
                                <div className="mt-4 bg-light-concrete text-sm p-4 rounded">
                                  You did not specify a function. If you mean to send eth to the
                                  target, continue on. Otherwise, please add a function.
                                </div>
                              )}
                            </>
                          )
                        }}
                      />
                    </CreateTxWizard.Page>
                    <CreateTxWizard.Page>
                      {/* Value */}
                      <OptionalTextField
                        title="Value"
                        fieldName={`value`}
                        placeholder="Value to be sent (in wei)"
                      />
                    </CreateTxWizard.Page>
                  </CreateTxWizard>
                </div>
              ) : (
                <Button
                  type={ButtonType.Primary}
                  onClick={() => setTxBuilderShowing(true)}
                  className="mt-4"
                >
                  Add Transaction
                </Button>
              )}

              {/* BUTTONS */}
              <div className="mt-12 flex justify-between">
                <Button type={ButtonType.Unemphasized} onClick={goBack}>
                  Back
                </Button>
                <Button isSubmitType={true} isLoading={isLoading} isDisabled={formState.invalid}>
                  Next
                </Button>
              </div>
            </form>
          )
        }}
      />
    </>
  )
}
