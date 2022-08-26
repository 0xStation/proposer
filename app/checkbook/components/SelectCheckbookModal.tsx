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
import { LINKS } from "app/core/utils/constants"
import { ProposalMetadata } from "app/proposal/types"

export const SelectCheckbookModal = ({ isOpen, setIsOpen, terminal, proposal }) => {
  const router = useRouter()
  const setToastState = useStore((state) => state.setToastState)

  const [checkbooks, { refetch: refetchCheckbooks }] = useQuery(
    getCheckbooksByTerminal,
    {
      terminalId: terminal?.id as number,
      chainId: (proposal.data as ProposalMetadata).funding.chainId,
    },
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

  const terminalHasCheckbook = (checkbooks?.length || 0) > 0

  // shown if station has no checkbooks to guide creating one
  const createCheckbookView = (
    <div className="p-2">
      <Image src={CheckAnimation} alt="Checkbook animation." />
      <h3 className="text-2xl font-bold pt-6">Create your first Checkbook</h3>
      <p className="mt-2">
        To start deploying funds to the proposals, create a Checkbook and connect it to this
        proposal. Checkbook is a multi-signature wallet created for funding operations. Proposal
        contributors will be able to claim their funding once the proposal has been approved by the
        assigned Checkbook.
      </p>
      <div className="mt-8">
        <Link href={LINKS.CHECKBOOK} passHref>
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

  // shown if station has checkbooks to guide selecting one
  const selectCheckbookView = (
    <div className="p-2">
      <h3 className="text-2xl font-bold pt-6">Select a Checkbook</h3>
      <p className="mt-2">
        To start deploying funds to the proposals, create and connect this proposal to a Checkbook.
        Proposal contributors will be able to claim funding once this proposal has been approved by
        the assigned Checkbook.
      </p>
      <Form
        initialValues={{
          checkbookAddress: checkbooks?.[0]?.address,
        }}
        onSubmit={async (values: any) => {
          const selectedCheckbook = checkbooks?.find((checkbook) =>
            addressesAreEqual(checkbook.address, values.checkbookAddress)
          )

          if (!selectedCheckbook) {
            setToastState({
              isToastShowing: true,
              type: "error",
              message: "Checkbook assignment failed.",
            })
            return
          }

          try {
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
          } catch (e) {
            console.error(e)
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
                        {checkbooks?.map((checkbook, idx) => {
                          return (
                            <option key={checkbook.address} value={checkbook.address}>
                              {checkbook.name}
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
      {terminalHasCheckbook ? selectCheckbookView : createCheckbookView}
    </Modal>
  )
}

export default SelectCheckbookModal
