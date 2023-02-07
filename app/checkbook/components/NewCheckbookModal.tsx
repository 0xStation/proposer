import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { useEffect, useState } from "react"
import Modal from "app/core/components/sds/overlays/modal"
import Button from "app/core/components/sds/buttons/Button"
import { Form, Field } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import createCheckbook from "app/checkbook/mutations/createCheckbook"
import { Account } from "app/account/types"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import networks from "app/utils/networks.json"
import useAddCheckbookToSafe from "../hooks/useAddCheckbookToSafe"
import { TextField } from "app/core/components/form/TextField"
import { requiredField } from "app/utils/validators"
import { useCheckbooks } from "../hooks/useCheckbooks"
import { Interface } from "@ethersproject/abi"
import { useSendTransaction, useWaitForTransaction } from "wagmi"
import { ZERO_ADDRESS, CHECKBOOK_MODULE_ADDRESS } from "app/core/utils/constants"

export const NewCheckbookModal = ({
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
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [safes, setSafes] = useState<string[]>([])
  const [safeOptions, setSafeOptions] = useState<string[]>([])
  const router = useRouter()

  const { checkbooks } = useCheckbooks([])

  const [createCheckbookMutation] = useMutation(createCheckbook, {
    onSuccess: async (checkbook) => {
      setIsOpen(false)
      router.push(Routes.CheckbookHome({ chainId: checkbook.chainId, address: checkbook.address }))
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

  const { signMessage: signAddCheckbookModule } = useAddCheckbookToSafe({ chainId: activeChain.id })

  useEffect(() => {
    // get multisigs for user
    const fetchSafes = async (address: string) => {
      const network = networks[activeChain.id]?.gnosisNetwork
      // only absolute urls supported
      const url = `https://safe-transaction-${network}.safe.global/api/v1/owners/${toChecksumAddress(
        address
      )}/safes`
      let data
      try {
        const response = await fetch(url)
        data = await response.json()
      } catch (err) {
        console.error("Failed to fetch safe", err)
        return
      }
      setSafes(data.safes)
    }
    if (activeUser?.address) {
      try {
        fetchSafes(activeUser.address)
      } catch {}
    }
  }, [activeUser, activeChain])

  useEffect(() => {
    setSafeOptions(
      safes.filter(
        (safe) =>
          !checkbooks?.some(
            (checkbook) => activeChain.id === checkbook.chainId && safe === checkbook.address
          )
      )
    )
  }, [safes, checkbooks])

  const { sendTransactionAsync } = useSendTransaction({ mode: "recklesslyUnprepared" })

  const createSafe = async () => {
    const initializeModuleInterface = new Interface(["function enableModuleWithinDeploy()"])
    const initializeModuleData = initializeModuleInterface.encodeFunctionData(
      "enableModuleWithinDeploy"
    )
    const params = [
      ["0x6860c9323d4976615ae515ab4b0039d7399e7cc8"], // owners
      1, // threshold
      CHECKBOOK_MODULE_ADDRESS[5], // to
      initializeModuleData, // data
      ZERO_ADDRESS, // fallbackHandler
      ZERO_ADDRESS, // paymentToken
      0, // payment
      ZERO_ADDRESS, // paymentReceiver
    ]
    const setupSafeInterface = new Interface([
      "function setup(address[] calldata _owners,uint256 _threshold,address to,bytes calldata data,address fallbackHandler,address paymentToken,uint256 payment,address payable paymentReceiver)",
    ])
    const setupSafeData = setupSafeInterface.encodeFunctionData("setup", params)

    const createSafeInterface = new Interface([
      "function createProxyWithNonce(address _singleton, bytes initializer, uint256 saltNonce)",
    ])

    let date = new Date()
    const data = createSafeInterface.encodeFunctionData("createProxyWithNonce", [
      "0x3E5c63644E683549055b9Be8653de26E0B4CD36E", // need to check goerli or mainnet
      setupSafeData,
      date.getTime(), // convert date to ms to count as seed
    ])

    const transaction = await sendTransactionAsync({
      recklesslySetUnpreparedRequest: {
        chainId: 5,
        to: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
        value: 0,
        data,
      },
    })

    console.log(transaction)
  }

  return (
    <Modal
      open={isOpen}
      toggle={() => {
        setIsOpen(!isOpen)
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Create a Checkbook</h1>
        <p className="mt-4">
          Checkbooks are attached on top of Gnosis Safes and use the same set of signers and
          approval threshold to authenticate transactions.
        </p>
        <Form
          initialValues={{}}
          onSubmit={async (values) => {
            setIsLoading(true)
            const signatureData = await signAddCheckbookModule(values.safeAddress)
            if (!signatureData) return
            try {
              createCheckbookMutation({
                address: values.safeAddress,
                chainId: activeChain.id,
                name: values.name,
                safeTxHash: signatureData.detailedExecutionInfo?.safeTxHash,
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
                <label className="font-bold block mt-6">Select a Gnosis Safe*</label>
                <span className="text-xs text-light-concrete block mb-2">
                  To see different options, change your network.
                </span>
                <Field
                  placeholder="Select a Gnosis Safe"
                  name="safeAddress"
                  component="select"
                  className="w-full bg-wet-concrete p-2 rounded text-marble-white"
                  validate={requiredField}
                >
                  <option value="" disabled selected>
                    Select one
                  </option>
                  {safeOptions.map((safe: any, idx) => {
                    return (
                      <option key={idx} value={safe}>
                        {safe}
                      </option>
                    )
                  })}
                </Field>
                <button
                  className="text-electric-violet mt-1 underline"
                  onClick={() => createSafe()}
                >
                  Create safe
                </button>
                <TextField
                  title="Name*"
                  fieldName="name"
                  placeholder="Enter name for this checkbook"
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

export default NewCheckbookModal
