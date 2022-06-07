import { BlitzPage, useMutation, useParam, useQuery } from "blitz"
import { Field, Form } from "react-final-form"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import createTokenTag from "app/tag/mutations/createTokenTag"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Navigation from "app/terminal/components/settings/navigation"
import useStore from "app/core/hooks/useStore"

const NewTokenSettingsPage: BlitzPage = () => {
  const [createTokenTagMutation] = useMutation(createTokenTag)

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const setToastState = useStore((state) => state.setToastState)

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <div className="px-6 py-8">
          <h1 className="text-xl">New Token</h1>
          <Form
            initialValues={{}}
            onSubmit={async (values) => {
              if (terminal) {
                try {
                  await createTokenTagMutation({
                    terminalId: terminal.id,
                    name: "M",
                    type: "ERC20",
                    symbol: "DD",
                    address: "0x",
                    chainId: 1,
                  })

                  setToastState({
                    isToastShowing: true,
                    type: "success",
                    message: "Your tag has been created.",
                  })
                } catch (e) {
                  setToastState({
                    isToastShowing: true,
                    type: "error",
                    message: "Token already exists.",
                  })
                }
              }
            }}
            render={({ form, handleSubmit }) => {
              const formState = form.getState()
              return (
                <form onSubmit={handleSubmit} className="mt-12">
                  <div className="flex flex-col w-1/2">
                    <h3 className="font-bold">Chain*</h3>
                    <Field
                      name="chainId"
                      component="select"
                      className="bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                    >
                      <option />
                      <option value="1">Ethereum</option>
                      <option value="4">Rinkeby</option>
                    </Field>
                    <h3 className="font-bold mt-4">Contract Address*</h3>
                    <Field
                      name="address"
                      component="input"
                      type="text"
                      placeholder="0x..."
                      className="bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                    />
                    <div>
                      <button
                        className={`rounded text-tunnel-black px-8 py-2 h-full mt-12 ${
                          formState.dirty ? "bg-magic-mint" : "bg-concrete"
                        }`}
                        type="submit"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              )
            }}
          />
        </div>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

export default NewTokenSettingsPage
