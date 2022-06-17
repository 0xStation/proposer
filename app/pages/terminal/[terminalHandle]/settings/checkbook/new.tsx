import { BlitzPage, useMutation, useParam, useQuery, Link, Image, Routes, useRouter } from "blitz"
import { Field, Form } from "react-final-form"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import createCheckbook from "app/checkbook/mutations/createCheckbook"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Navigation from "app/terminal/components/settings/navigation"
import useStore from "app/core/hooks/useStore"
import Back from "/public/back-icon.svg"
import { v4 as uuidv4 } from "uuid"
import { parseUniqueAddresses } from "app/core/utils/parseUniqueAddresses"
import { uniqueName, isValidQuorum } from "app/utils/validators"

const NewCheckbookSettingsPage: BlitzPage = () => {
  const router = useRouter()
  const [createCheckbookMutation] = useMutation(createCheckbook)

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle, include: ["checkbooks"] },
    { suspense: false }
  )

  const setToastState = useStore((state) => state.setToastState)

  type FormValues = {
    name: string
    signers: string
    quorum: string
  }

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <div className="px-6 py-8">
          <div className="flex flex-row space-x-4">
            <Link href={Routes.CheckbookSettingsPage({ terminalHandle })}>
              <Image
                src={Back}
                alt="Close button"
                width={16}
                height={16}
                className="cursor-pointer"
              />
            </Link>
            <h1 className="text-2xl font-bold">New Checkbook</h1>
          </div>
          <Form
            initialValues={{}}
            onSubmit={async (values: FormValues) => {
              if (terminal) {
                try {
                  // validation on checksum addresses, no duplicates
                  const signers = parseUniqueAddresses(values.signers || "")

                  // trigger transaction, returns address of new Checkbook
                  // TODO: real transaction that populates `checkbookAddress`
                  let checkbookAddress = "0x" + uuidv4().replace(/-/g, "") // placeholder, fake address

                  try {
                    await createCheckbookMutation({
                      terminalId: terminal.id,
                      address: checkbookAddress,
                      chainId: 1, // ETH mainnet, change once checkbooks are multichain
                      name: values.name,
                      quorum: parseInt(values.quorum),
                      signers,
                    })

                    router.push(Routes.CheckbookSettingsPage({ terminalHandle }))
                  } catch (e) {
                    console.error(e)
                    setToastState({
                      isToastShowing: true,
                      type: "error",
                      message: "Checkbook creation failed.",
                    })
                  }
                } catch (e) {
                  console.error(e)
                }
              }
            }}
            render={({ form, handleSubmit }) => {
              const formState = form.getState()
              return (
                <form onSubmit={handleSubmit} className="mt-12">
                  <div className="flex flex-col w-1/2">
                    <h3 className="font-bold">Checkbook name*</h3>
                    <Field
                      name="name"
                      validate={uniqueName(terminal?.checkbooks?.map((c) => c.name) || [])}
                    >
                      {({ input, meta }) => (
                        <div>
                          <input
                            {...input}
                            type="text"
                            placeholder="e.g. 2022 Q3 Grants"
                            className="w-full bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                          />
                          {/* this error shows up when the user focuses the field (meta.touched) */}
                          {meta.error && meta.touched && (
                            <span className=" text-xs text-torch-red p-2 block">{meta.error}</span>
                          )}
                        </div>
                      )}
                    </Field>
                    <h3 className="font-bold mt-4">Checkbook signers*</h3>
                    <span className="text-xs text-concrete block">
                      Insert wallet addresses whose signatures are required to create checks, deploy
                      funds, and edit this Checkbook’s information.
                    </span>
                    <Field
                      name="signers"
                      // automatically enter new lines for user
                      format={(value) => value?.replace(/,\s*|\s+/g, ",\n")}
                    >
                      {({ input }) => (
                        <div>
                          <textarea
                            {...input}
                            className="w-full bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                            rows={4}
                            placeholder="Enter wallet addresses"
                          />
                          {/* user feedback on number of registered unique addresses, not an error */}
                          {input && (
                            <span className=" text-xs text-marble-white ml-2 mb-2 block">
                              {`${
                                parseUniqueAddresses(input.value || "").length
                              } unique addresses detected`}
                            </span>
                          )}
                        </div>
                      )}
                    </Field>
                    <h3 className="font-bold mt-4">Approval quorum*</h3>
                    <span className="text-xs text-concrete block">
                      The number of signers required for a proposal to be approved and for a check
                      to be generated.
                      <br />
                      <a href="#" className="text-magic-mint">
                        Learn more
                      </a>
                    </span>
                    <Field
                      name="quorum"
                      validate={isValidQuorum(
                        parseUniqueAddresses(formState.values.signers || "").length
                      )}
                    >
                      {({ input, meta }) => (
                        <div>
                          <input
                            {...input}
                            type="text"
                            placeholder="1"
                            className="w-full bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                          />
                          {/* this error shows up when the user focuses the field (meta.touched) */}
                          {meta.error && meta.touched && (
                            <span className=" text-xs text-torch-red p-2 block">{meta.error}</span>
                          )}
                        </div>
                      )}
                    </Field>
                    <div>
                      <button
                        className={`rounded text-tunnel-black px-8 py-2 h-full mt-12 ${
                          formState.values.name &&
                          formState.values.signers &&
                          formState.values.quorum &&
                          !formState.hasValidationErrors
                            ? "bg-magic-mint"
                            : "bg-concrete"
                        }`}
                        type="submit"
                        disabled={
                          !formState.values.name ||
                          !formState.values.signers ||
                          !formState.values.quorum ||
                          formState.hasValidationErrors
                        }
                      >
                        Create
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

export default NewCheckbookSettingsPage
