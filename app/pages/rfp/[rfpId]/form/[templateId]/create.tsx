import { BlitzPage, useQuery, useParam } from "blitz"
import Layout from "app/core/layouts/Layout"
import BaseForm from "app/template/components/baseForm"
import getTemplateById from "app/template/queries/getTemplateById"
import { RESERVED_KEYS } from "app/template/types"

const CreateTemplateForm: BlitzPage = () => {
  const templateId = useParam("templateId") as string
  const [template] = useQuery(getTemplateById, { id: templateId }, { suspense: false })

  const isFundingProposal = template?.data?.fields?.some(
    (field) => field.key === RESERVED_KEYS.PAYMENTS
  )

  const proposalFormType = isFundingProposal ? "FUNDING" : "NON_FUNDING"

  console.log("isFundingProposal", isFundingProposal)
  return (
    <Layout title="New Proposal">
      <BaseForm template={template} formType={proposalFormType} />
    </Layout>
  )
}

CreateTemplateForm.suppressFirstRenderFlicker = true

export default CreateTemplateForm
