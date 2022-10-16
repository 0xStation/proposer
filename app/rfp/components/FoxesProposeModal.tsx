import { useState } from "react"
import { useMutation, invalidateQuery, useSession, useRouter, Routes } from "blitz"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { Field, Form } from "react-final-form"
import { composeValidators, isValidTransactionLink, requiredField } from "app/utils/validators"
import { getNetworkExplorer } from "app/core/utils/networkInfo"
import getProposalById from "app/proposal/queries/getProposalById"
import { txPathString } from "app/core/utils/constants"
import saveTransactionHashToPayments from "app/proposal/mutations/saveTransactionToPayments"
import createProposalToFoxesRfp from "app/proposal/mutations/createProposalToFoxesRfp"
import getProposalsByRfpId from "app/proposal/queries/getProposalsByRfpId"
import { genProposalDigest } from "app/signatures/proposal"
import useSignature from "app/core/hooks/useSignature"
import { getHash } from "app/signatures/utils"
import sendProposal from "app/proposal/mutations/sendProposal"
import deleteProposalById from "app/proposal/mutations/deleteProposalById"

export const FoxesProposeModal = ({ isOpen, setIsOpen, rfp }) => {
  const activeUser = useStore((state) => state.activeUser)
  const session = useSession({ suspense: false })
  const setToastState = useStore((state) => state.setToastState)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const { signMessage } = useSignature()

  const [createProposalToFoxesRfpMutation] = useMutation(createProposalToFoxesRfp, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const [deleteProposalByIdMutation] = useMutation(deleteProposalById, {
    onSuccess: (_data) => {
      console.log("proposal deleted: ", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const [sendProposalMutation] = useMutation(sendProposal, {
    onSuccess: (data) => {
      invalidateQuery(getProposalsByRfpId)
      setIsLoading(false)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Successfully published proposal.",
      })
      setIsOpen(false)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const submitFoxesProposal = async (details: string) => {
    try {
      console.log(session)
      console.log(!session?.siwe?.address)
      if (!session?.siwe?.address) {
        setIsLoading(false)
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Not signed in, please connect wallet and sign in.",
        })
        return
      }

      console.log("past address check")

      setIsLoading(true)

      // mutation
      const proposal = await createProposalToFoxesRfpMutation({
        rfpId: rfp.id,
        contentTitle: `${rfp?.data?.content.title} submission`,
        contentBody: details,
        authorAddress: session.siwe!.address,
      })

      // prompt author to sign proposal to prove they are the author of the content
      const message = genProposalDigest(proposal)
      const signature = await signMessage(message)

      if (!signature) {
        // TODO: delete proposal
        deleteProposalByIdMutation({ proposalId: proposal.id })
        throw Error("Unsuccessful signature.")
      }

      const { domain, types, value } = message
      const proposalHash = getHash(domain, types, value)

      await sendProposalMutation({
        proposalId: proposal?.id as string,
        authorAddress: session?.siwe?.address as string,
        authorSignature: signature as string,
        signatureMessage: message,
        proposalHash: proposalHash,
      })
    } catch (e) {
      console.error("Failed to submit proposal", e)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: e.message,
      })
      setIsLoading(false)
    }
  }

  const SubmitFoxesProposalContent = () => {
    return (
      <>
        <h3 className="text-2xl font-bold mt-4">Propose</h3>
        <p className="mt-2">Submit a response to the term.</p>
        <Form
          onSubmit={async (values) => {
            await submitFoxesProposal(values.body)
          }}
          render={({ handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                <label className="font-bold block mt-12">Details*</label>
                <Field name="body" component="textarea" validate={composeValidators(requiredField)}>
                  {({ meta, input }) => (
                    <>
                      <textarea
                        {...input}
                        rows={6}
                        placeholder="Write something profound"
                        className="bg-wet-concrete rounded mt-1 w-full p-2"
                      />

                      {meta.touched && meta.error && (
                        <span className="text-torch-red text-xs">{meta.error}</span>
                      )}
                    </>
                  )}
                </Field>
                <div className="mt-8">
                  <Button isLoading={isLoading} isDisabled={isLoading} isSubmitType={true}>
                    Submit
                  </Button>
                </div>
              </form>
            )
          }}
        />
      </>
    )
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <SubmitFoxesProposalContent />
    </Modal>
  )
}

export default FoxesProposeModal
