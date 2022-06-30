import { BlitzPage } from "blitz"
import { useState } from "react"
import { useSignTypedData, useToken } from "wagmi"
import Navigation from "app/terminal/components/settings/navigation"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import { useQuery, useMutation, useParam } from "blitz"
import cashCheck from "app/check/mutations/cashCheck"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getPendingChecksByTerminal from "app/check/queries/getPendingChecksByTerminal"
import { zeroAddress } from "app/core/utils/constants"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"
import { Check } from "@prisma/client"

/**
 * THIS IS A DEV TOOL
 * this is not production code
 * this is not meant to have good UX or be what users see/touch
 * this is meant to show a dev how cash checks
 */

const CashCheckPage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle }
  )

  const [pendingChecks] = useQuery(
    getPendingChecksByTerminal,
    { terminalId: terminal?.id as number },
    { suspense: false, enabled: !!terminal }
  )

  const [cashCheckMutation] = useMutation(cashCheck, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <section className="flex-1 ml-10">
          <h2 className="text-marble-white text-2xl font-bold mt-10">Generate Check</h2>
          <Form
            onSubmit={async (values: any, form) => {
              try {
                console.log(values)
                await cashCheckMutation({
                  checkId: values.checkId,
                  txnHash: "",
                })

                setToastState({
                  isToastShowing: true,
                  type: "success",
                  message: "Check cashed.",
                })
              } catch (e) {
                console.error(e)
                if (e.name == "ConnectorNotFoundError") {
                  setToastState({
                    isToastShowing: true,
                    type: "error",
                    message: "Please reset wallet connection.\n(ConnectorNotFoundError)",
                  })
                } else {
                  setToastState({
                    isToastShowing: true,
                    type: "error",
                    message: "Contract creation failed.",
                  })
                }
                return false
              }
            }}
            render={({ form, handleSubmit }) => {
              const formState = form.getState()
              const disableSubmit = !formState.values.checkId
              return (
                <form onSubmit={handleSubmit}>
                  <div className="w-1/3 flex flex-col col-span-2 mt-6">
                    <label className="font-bold block">Check*</label>
                    <Field name={`checkId`}>
                      {({ input }) => (
                        <div className="custom-select-wrapper">
                          <select
                            {...input}
                            className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-1`}
                          >
                            <option value="">Choose option</option>
                            {pendingChecks?.map((check, idx) => {
                              return (
                                <option key={`checkbook-${idx}`} value={check.id}>
                                  {`${check.tokenAmount} ___ to ${check.recipientAddress}`}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )}
                    </Field>
                    <button
                      type="submit"
                      className={`rounded text-tunnel-black text-bold px-8 py-2 w-full mt-12 ${
                        disableSubmit ? "bg-concrete" : "bg-electric-violet"
                      }`}
                      disabled={disableSubmit}
                    >
                      Cash Check
                    </button>
                  </div>
                </form>
              )
            }}
          />
        </section>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

CashCheckPage.suppressFirstRenderFlicker = true

export default CashCheckPage
