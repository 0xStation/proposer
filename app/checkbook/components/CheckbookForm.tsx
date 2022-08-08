import { track } from "@amplitude/analytics-browser"
import { useEffect } from "react"
import { useCreateCheckbookOnChain } from "app/contracts/checkbook"
import { Spinner } from "app/core/components/Spinner"
import { useNetwork } from "wagmi"
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
  name: string
  signers: string
  quorum: string
}

export const CheckbookForm = ({ callback, isEdit = true, pageName }) => {
  const [createCheckbookMutation] = useMutation(createCheckbook)
  const [quorum, setQuorum] = useState<number>()
  const [signers, setSigners] = useState<string[]>()
  const [name, setName] = useState<string>()
  const [txnHash, setTxnHash] = useState<string>()
  const [waitingCreation, setWaitingCreation] = useState<boolean>(false)
  const [isDeployingCheckbook, setIsDeployingCheckbook] = useState<boolean>(false)
  const setToastState = useStore((state) => state.setToastState)
  const activeUser = useStore((state) => state.activeUser)
  const router = useRouter()

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal, { isSuccess: finishedFetchingTerminal }] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle, include: ["checkbooks"] },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )

  const { activeChain } = useNetwork()
  const chainId = activeChain?.id as number
  const { createCheckbook: createCheckbookOnChain } = useCreateCheckbookOnChain(chainId)

  useEffect(() => {
    if (finishedFetchingTerminal && activeUser?.address) {
      track("create_checkbook_page_shown", {
        event_category: "impression",
        page: pageName,
        station_id: terminal?.id,
        station_name: terminalHandle,
        address: activeUser?.address,
      })
    }
  }, [finishedFetchingTerminal, activeUser?.address])

  const data = useWaitForTransaction({
    confirmations: 1,
    hash: txnHash,
    onSuccess: async (data) => {
      // transaction emits an event that contains the address of the new Checkbook
      // events are contained in the TransactionReceipt's `.logs` field
      // in the checkbook creation transaction, variable number of logs are emitted in this order:
      // * n SignerAdded(signer) for n signers
      // * 1 QuorumUpdated(quorum)
      // * 1 CheckbookCreated(checkbook, quorum, signers)
      // we want the last event, so we parse the last log in the list
      const eventCheckbookCreated = data.logs[data.logs.length - 1]
      // each log has a `topics` list object for event parameters that have an index
      // the first topic is always the name of the event, the next is our Checkbook address and does not change once deployed
      const topicCheckbookAddress = eventCheckbookCreated?.topics[1]
      // a topic string has 32 bytes, but an address is only 20 bytes so the topic is 0-padded in the front
      // a topic string also adds "0x" to the front of its 32 bytes
      // to get the address, we throw away the first 2 characters ("0x") + the next 2*12bytes characters (0-padding)
      // which leads us to throw away first 26 characters using `.substring(26)` and extract the address string
      // this string is lowercased though, so we checksum it to give it proper casing before storing in database
      const checkbookAddress = toChecksumAddress("0x" + topicCheckbookAddress?.substring(26))

      track("checkbook_contract_created", {
        page: pageName,
        event_category: "event",
        address: activeUser?.address,
        quorum,
        signers,
        checkbook_name: name,
        checkbook_address: checkbookAddress,
        station_id: terminal?.id,
        station_name: terminalHandle,
      })

      try {
        await createCheckbookMutation({
          terminalId: terminal?.id as number,
          address: checkbookAddress,
          chainId,
          name: name as string,
          quorum: quorum as number,
          signers: signers as string[],
        })

        track("checkbook_model_created", {
          page: pageName,
          event_category: "event",
          address: activeUser?.address,
          quorum,
          signers,
          checkbook_name: name,
          checkbook_address: checkbookAddress,
          station_name: terminalHandle,
          station_id: terminal?.id,
        })

        if (callback) {
          callback(checkbookAddress)
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
              track("checkbook_create_button_clicked", {
                page: pageName,
                event_category: "click",
                address: activeUser?.address,
                quorum,
                signers,
                checkbook_name: values.name,
                station_name: terminalHandle,
                station_id: terminal?.id,
              })
              setQuorum(quorum)
              setSigners(signers)
              setName(values.name)
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
              track("checkbook_create_error", {
                page: pageName,
                event_category: "error",
                address: activeUser?.address,
                quorum,
                signers,
                checkbook_name: values.name,
                error_msg: e.name,
                station_name: terminalHandle,
                station_id: terminal?.id,
              })
            }
          } catch (e) {
            track("checkbook_create_error", {
              page: pageName,
              event_category: "error",
              address: activeUser?.address,
              quorum,
              signers,
              checkbook_name: values.name,
              error_msg: e.name,
              station_name: terminalHandle,
              station_id: terminal?.id,
            })
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
          formState.hasValidationErrors
        return (
          <form onSubmit={handleSubmit}>
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
                      placeholder="e.g. Q3 2022 Grants"
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
                Enter the wallet addresses whose signatures are required to create checks, deploy
                funds, and edit this Checkbook&apos;s information.
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
                The number of signatories required for a proposal to be approved and a check to be
                generated.{" "}
                <a
                  href="https://station-labs.gitbook.io/station-product-manual/for-daos-communities/checkbook"
                  className="text-electric-violet"
                >
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
                      placeholder="0"
                      className="w-full bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className=" text-xs text-torch-red p-2 block">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
              <div className="mt-12 mb-12">
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
