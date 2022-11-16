import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { ProposalTemplateMetadata } from "app/template/types"
import {
  getBodyPrefill,
  getClientAddress,
  getMinNumWords,
  getPaymentAmount,
  getPaymentToken,
  getPayments,
  getTotalPaymentAmount,
  getPaymentTerms,
} from "app/template/utils"
import db, { ProposalRoleType } from "db"

const seed = async () => {
  const rfps = await db.rfp.findMany({
    include: {
      template: true,
    },
  })

  rfps.forEach(async (rfp) => {
    if (!rfp.template) return
    const templateFields = (rfp.template?.data as ProposalTemplateMetadata)?.fields

    const proposalMetadata = {
      ...(addressesAreEqual(getClientAddress(templateFields), rfp.accountAddress)
        ? {
            requesterRole: ProposalRoleType.CLIENT,
            proposerRole: ProposalRoleType.CONTRIBUTOR,
          }
        : {
            requesterRole: ProposalRoleType.CONTRIBUTOR,
            proposerRole: ProposalRoleType.CLIENT,
          }),
      body: {
        prefill: getBodyPrefill(templateFields),
        minWordCount: getMinNumWords(templateFields),
      },
      payment: {
        token: getPaymentToken(templateFields),
        minAmount: getTotalPaymentAmount(templateFields),
        maxAmount: getTotalPaymentAmount(templateFields),
        terms: getPaymentTerms(templateFields),
        advancePaymentPercentage:
          getPayments(templateFields)?.length > 1
            ? (100 * getPaymentAmount(templateFields)) / getTotalPaymentAmount(templateFields)
            : undefined,
      },
    }

    const rfpMetadata = {
      ...Object(rfp.data),
      proposal: proposalMetadata,
    }

    await db.rfp.update({
      where: { id: rfp.id },
      data: {
        data: rfpMetadata,
      },
    })
  })
}

export default seed
