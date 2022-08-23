import { useMutation, useRouter, Image, useQuery, Link, Routes, invalidateQuery } from "blitz"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import CheckAnimation from "public/check_animation.gif"
import { Field, Form } from "react-final-form"
import getCheckbooksByTerminal from "../queries/getCheckbooksByTerminal"
import assignProposalToCheckbook from "app/proposal/mutations/assignProposalToCheckbook"
import getCheckbookByProposal from "app/checkbook/queries/getCheckbookByProposal"
import { RefreshIcon } from "@heroicons/react/solid"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

export const SelectCheckbookModal = ({ isOpen, setIsOpen, terminal, proposal }) => {
  const router = useRouter()
  const setToastState = useStore((state) => state.setToastState)

  const [checkbooks, { refetch: refetchCheckbooks }] = useQuery(
    getCheckbooksByTerminal,
    { terminalId: terminal?.id as number },
    { suspense: false, enabled: !!terminal, refetchOnWindowFocus: false }
  )

  const [assignProposalToCheckbookMutation] = useMutation(assignProposalToCheckbook, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const stationHasCheckbook = (checkbooks?.length || 0) > 0

  const createCheckbookView = (
    <div className="p-2">
      <Image src={CheckAnimation} alt="Checkbook animation." />
      <h3 className="text-2xl font-bold pt-6">Create your first Checkbook</h3>
      <p className="mt-2">
        To start deploying funds to the proposals, create and connect the initiative to a Checkbook.
        Checkbook is a multi-signature wallet created for funding operations. Proposers will be able
        to claim once their projects have met the approval quorum.
      </p>
      <div className="mt-8">
        <Link
          href="https://station-labs.gitbook.io/station-product-manual/for-daos-communities/checkbook"
          passHref
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-electric-violet text-electric-violet rounded mr-2 px-4 h-[34px] leading-[34px] whitespace-nowrap hover:opacity-75"
          >
            Learn More
          </a>
        </Link>
        <Link
          href={Routes.NewCheckbookSettingsPage({
            terminalHandle: terminal?.handle,
          })}
          passHref
        >
          <a className="inline-block bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75">
            Continue
          </a>
        </Link>
      </div>
    </div>
  )

  const selectCheckbookView = (
    <div className="p-2">
      <h3 className="text-2xl font-bold pt-6">Select a Checkbook</h3>
      <p className="mt-2">
        To start deploying funds to the proposals, create and connect the RFP to a Checkbook.
        Proposers will be able to claim once their projects have met the approval quorum.
      </p>
      <Form
        initialValues={{
          checkbookAddress: checkbooks?.[0]?.address,
        }}
        onSubmit={async (values: any, form) => {
          const selectedCheckbook = checkbooks?.find((checkbook) =>
            addressesAreEqual(checkbook.address, values.checkbookAddress)
          )

          if (!selectedCheckbook) {
            throw Error("could not find checkbook?")
          }

          const success = await assignProposalToCheckbookMutation({
            proposalId: proposal.id,
            chainId: selectedCheckbook.chainId,
            checkbookAddress: selectedCheckbook.address,
          })

          if (success) {
            setToastState({
              isToastShowing: true,
              type: "success",
              message: "Assigned Checkbook to this proposal.",
            })
            // invalidate query to reset and fetch assigned checkbook
            invalidateQuery(getCheckbookByProposal)
            setIsOpen(false)
          } else {
            setToastState({
              isToastShowing: true,
              type: "error",
              message: "Checkbook assignment failed.",
            })
          }
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          const disableSubmit = !formState.values?.checkbookAddress
          return (
            <form onSubmit={handleSubmit}>
              <label className="font-bold block mt-8">Checkbook*</label>
              <Field name="checkbookAddress">
                {({ input, meta }) => {
                  return (
                    <div className="custom-select-wrapper">
                      <select
                        {...input}
                        className="w-full bg-wet-concrete border border-concrete rounded p-1 mt-1"
                      >
                        <option value="">Choose option</option>
                        {checkbooks?.map((cb, idx) => {
                          return (
                            <option key={cb.address} value={cb.address}>
                              {cb.name}
                            </option>
                          )
                        })}
                      </select>
                      {meta.touched && meta.error && (
                        <span className="text-torch-red text-xs">{meta.error}</span>
                      )}
                    </div>
                  )
                }}
              </Field>
              <div className="flex items-center justify-between mt-1">
                <Link
                  href={Routes.NewCheckbookSettingsPage({
                    terminalHandle: terminal?.handle,
                  })}
                  passHref
                >
                  <a target="_blank" rel="noopener noreferrer">
                    <span className="text-electric-violet cursor-pointer block">+ Create new</span>
                  </a>
                </Link>
                <RefreshIcon
                  className="h-4 w-4 text-white cursor-pointer"
                  onClick={() => {
                    refetchCheckbooks()
                    setToastState({
                      isToastShowing: true,
                      type: "success",
                      message: "Refetched checkbooks.",
                    })
                  }}
                />
              </div>
              <div className="mt-8">
                <button
                  type="button"
                  className="text-electric-violet border border-electric-violet mr-2 py-1 px-4 rounded hover:opacity-75"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75"
                  disabled={disableSubmit}
                >
                  Continue
                </button>
              </div>
            </form>
          )
        }}
      />
    </div>
  )

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      {stationHasCheckbook ? selectCheckbookView : createCheckbookView}
    </Modal>
  )
}

export default SelectCheckbookModal
