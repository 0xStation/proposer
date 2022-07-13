import { useCreateCheckbookOnChain } from "app/contracts/checkbook"
import Checkbox from "app/core/components/form/Checkbox"
import { Spinner } from "app/core/components/Spinner"
import useAllowedNetwork from "app/core/hooks/useAllowedNetwork"
import useStore from "app/core/hooks/useStore"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { parseUniqueAddresses } from "app/core/utils/parseUniqueAddresses"
import { sortAddressesIncreasing } from "app/core/utils/sortAddressesIncreasing"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { uniqueName, isValidQuorum } from "app/utils/validators"
import { useMutation, useParam, useQuery, useRouter, Routes } from "blitz"
import { useState } from "react"
import { Form, Field } from "react-final-form"
import { useWaitForTransaction } from "wagmi"
import createCheckbook from "../mutations/createCheckbook"

type FormValues = {
  checkbookFeeAcknowledgement: boolean
  name: string
  signers: string
  quorum: string
}

export const CheckbookForm = ({ callback, isEdit = true }) => {
  const [createCheckbookMutation] = useMutation(createCheckbook)
  const [quorum, setQuorum] = useState<number>()
  const [signers, setSigners] = useState<string[]>()
  const [name, setName] = useState<string>()
  const [checkbookFeeAcknowledgement, setCheckbookFeeAcknowledgement] = useState<boolean>(false)
  const [txnHash, setTxnHash] = useState<string>()
  const [waitingCreation, setWaitingCreation] = useState<boolean>(false)
  const [isDeployingCheckbook, setIsDeployingCheckbook] = useState<boolean>(false)
  const setToastState = useStore((state) => state.setToastState)
  const router = useRouter()

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle, include: ["checkbooks"] },
    { suspense: false }
  )

  const { chainId, error: invalidSelectedNetwork } = useAllowedNetwork()

  const { createCheckbook: createCheckbookOnChain } = useCreateCheckbookOnChain(chainId)

  const data = useWaitForTransaction({
    confirmations: 1,
    hash: txnHash,
    onSuccess: async (data) => {
      // transaction emits an event that contains the address of the new Checkbook
      // events are contained in the TransactionReceipt's `.logs` field
      // each log has a `topics` list object for event parameters that have an index
      // the first topic is always the name of the event, the next is our Checkbook address
      // the location of the Checkbook address in the topics array is dependent on ordering within the contract
      // a topic string has 32 bytes, but an address is only 20 bytes so the topic is 0-padded in the front
      // a topic string also adds "0x" to the front of its 32 bytes
      // to get the address, we throw away the first 2 characters ("0x") + the next 2*12bytes characters (0-padding)
      // which leads us to use `.substring(26)` and extract the address string
      // this string is lowercased though, so we checksum it to give it proper casing before storing in database
      const checkbookAddress = toChecksumAddress("0x" + data.logs[0]?.topics[1]?.substring(26))

      try {
        await createCheckbookMutation({
          terminalId: terminal?.id as number,
          address: checkbookAddress,
          chainId,
          name: name as string,
          quorum: quorum as number,
          signers: signers as string[],
          checkbookFeeAcknowledgement,
        })

        if (callback) {
          callback()
        }
      } catch (e) {
        setWaitingCreation(false)
        console.error(e)
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Checkbook entity creation failed.",
        })
      }
    },
  })

  return (
    <Form
      initialValues={{}}
      onSubmit={async (values: FormValues) => {
        if (terminal) {
          try {
            setWaitingCreation(true)
            const quorum = parseInt(values.quorum)
            // validation on checksummed addresses, no duplicates
            // must be sorted for contract to validate no duplicates
            const signers = sortAddressesIncreasing(parseUniqueAddresses(values.signers || ""))
            // trigger transaction
            // after execution, will save transaction hash to state to trigger waiting process to create Checkbook entity
            try {
              setQuorum(quorum)
              setSigners(signers)
              setName(values.name)
              setCheckbookFeeAcknowledgement(values.checkbookFeeAcknowledgement)
              const transaction = await createCheckbookOnChain({
                args: [quorum, signers],
              })
              setIsDeployingCheckbook(true)
              // triggers hook for useWaitForTransaction which parses checkbook address makes prisma mutation
              setTxnHash(transaction.hash)
            } catch (e) {
              setWaitingCreation(false)
              setIsDeployingCheckbook(false)
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
            }
          } catch (e) {
            setWaitingCreation(false)
            setIsDeployingCheckbook(false)
            console.error(e)
          }
        }
      }}
      render={({ form, handleSubmit }) => {
        const formState = form.getState()
        const formButtonDisabled =
          !formState.values.name ||
          !formState.values.signers ||
          !formState.values.quorum ||
          !formState.values.checkbookFeeAcknowledgement ||
          formState.hasValidationErrors ||
          !!invalidSelectedNetwork
        return (
          <form onSubmit={handleSubmit} className="mt-12">
            <div className="flex flex-col">
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
                      rows={6}
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
                The number of signers required for a proposal to be approved and for a check to be
                generated.{" "}
                <a href="#" className="text-electric-violet">
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
                      placeholder="e.g. 1"
                      className="w-full bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className=" text-xs text-torch-red p-2 block">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
              <div className="flex flex-row mt-6">
                <Checkbox name="checkbookFeeAcknowledgement" className="h-[18px]" />
                <p className="align-middle mx-4 leading-none text-sm">
                  I acknowledge that a 2.5% network fee will be applied upon fund deployment.*
                </p>
              </div>
              <div className="mt-12">
                {waitingCreation ? (
                  isDeployingCheckbook ? (
                    <p className="text-marble-white mb-2">
                      Sit tight. Contract is deploying. This might take a minute.
                    </p>
                  ) : (
                    <p className="text-marble-white mb-2">Check your wallet for next steps.</p>
                  )
                ) : null}
                {!isEdit && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(Routes.BulletinPage({ terminalHandle }))
                    }}
                    className="rounded text-electric-violet border border-electric-violet h-[35px] w-28 mr-2 hover:bg-wet-concrete"
                  >
                    Skip
                  </button>
                )}
                <button
                  className={`rounded text-tunnel-black w-28 h-[35px] mb-8 bg-electric-violet ${
                    formButtonDisabled
                      ? "opacity-70 cursor-not-allowed"
                      : "opacity-100 cursor-pointer"
                  }`}
                  type="submit"
                  disabled={formButtonDisabled || waitingCreation}
                >
                  {waitingCreation ? (
                    <div className="flex justify-center items-center">
                      <Spinner fill="black" />
                    </div>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </div>
          </form>
        )
      }}
    />
  )
}

export default CheckbookForm