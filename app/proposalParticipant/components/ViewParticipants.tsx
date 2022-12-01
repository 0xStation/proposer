import {
  AddressType,
  ParticipantApprovalStatus,
  ProposalParticipant,
  ProposalStatus,
} from "@prisma/client"
import { AccountPill } from "app/account/components/AccountPill"
import GnosisSafeSignersModal from "app/core/components/GnosisSafeSignersModal"
import { ModuleBox } from "app/core/components/ModuleBox"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import useStore from "app/core/hooks/useStore"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { addressRepresentsAccount } from "app/core/utils/addressRepresentsAccount"
import { PROPOSAL_ROLE_APPROVAL_STATUS_MAP } from "app/core/utils/constants"
import { useEffect, useState } from "react"
import { useParticipants } from "../hooks/useParticipants"

const ParticipantRow = ({ proposal, participant, setSelectedParticipant }) => {
  const activeUser = useStore((state) => state.activeUser)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)

  const activeUserHasSigned = participant.signatures
    ?.filter((signature) => signature?.proposalVersion === proposal?.version)
    .some((signature) => addressesAreEqual(signature.address, activeUser?.address))

  const userRepresentsParticipant = addressRepresentsAccount(
    activeUser?.address || "",
    participant?.account
  )

  const showApproveButton =
    proposal?.status === ProposalStatus.AWAITING_APPROVAL &&
    userRepresentsParticipant &&
    !activeUserHasSigned

  return (
    <tr className="h-14">
      {/* ACCOUNT */}
      <td>
        <div className="flex flex-row space-x-2 items-center">
          <AccountPill account={participant?.account} />
          {participant?.account?.addressType === AddressType.SAFE && (
            <p
              className="text-sm text-electric-violet font-bold mt-1 cursor-pointer"
              onClick={() => setSelectedParticipant(participant)}
            >
              See multisig signers
            </p>
          )}
        </div>
      </td>
      {/* APPROVAL */}
      <td>
        <div className="flex flex-row space-x-4 items-center justify-end">
          {participant?.account?.addressType === AddressType.SAFE &&
            participant.approvalStatus !== ParticipantApprovalStatus.APPROVED && (
              <ProgressCircleAndNumber
                numerator={participant.signatures.length}
                denominator={participant.account.data?.quorum}
              />
            )}
          {showApproveButton ? (
            <span
              className="cursor-pointer text-sm text-electric-violet font-bold"
              onClick={() => toggleProposalApprovalModalOpen(true)}
            >
              Approve
            </span>
          ) : (
            <div className="flex flex-row items-center space-x-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  PROPOSAL_ROLE_APPROVAL_STATUS_MAP[participant.approvalStatus]?.color
                }`}
              />
              <div className="font-bold text-xs uppercase tracking-wider">
                {PROPOSAL_ROLE_APPROVAL_STATUS_MAP[participant.approvalStatus]?.copy}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

export const ViewParticipants = ({ proposal, className }) => {
  const [selectedParticipant, setSelectedParticipant] = useState<ProposalParticipant | null>()
  const [toggleParticipantSigners, setToggleParticipantSigners] = useState<boolean>(false)
  const { participants } = useParticipants(proposal?.id)

  useEffect(() => {
    if (selectedParticipant) {
      setToggleParticipantSigners(true)
    }
  }, [selectedParticipant])

  useEffect(() => {
    if (!toggleParticipantSigners) {
      setSelectedParticipant(null)
    }
  }, [toggleParticipantSigners])

  return (
    <>
      <GnosisSafeSignersModal
        isOpen={toggleParticipantSigners}
        setIsOpen={setToggleParticipantSigners}
        participant={selectedParticipant}
      />
      <ModuleBox isLoading={!!participants} className={className}>
        <div className="text-lg font-bold">Participants</div>
        <table className="mt-2">
          {/* HEADERS */}
          <tr>
            <th className="w-full"></th>
            <th className=""></th>
          </tr>
          {/* BODY */}
          <tbody>
            {participants?.map((participant, idx) => {
              return (
                <ParticipantRow
                  proposal={proposal}
                  participant={participant}
                  setSelectedParticipant={setSelectedParticipant}
                  key={idx}
                />
              )
            })}
          </tbody>
        </table>
      </ModuleBox>
    </>
  )
}
