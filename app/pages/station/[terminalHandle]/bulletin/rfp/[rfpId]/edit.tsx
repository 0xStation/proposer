import { BlitzPage, useQuery, useParam, GetServerSideProps, getSession, invoke } from "blitz"
import Layout from "app/core/layouts/Layout"
import getCheckbooksByTerminal from "app/checkbook/queries/getCheckbooksByTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RfpMarkdownForm from "app/rfp/components/RfpMarkdownForm"
import getRfpById from "app/rfp/queries/getRfpById"
import { Terminal } from "app/terminal/types"
import { Rfp } from "app/rfp/types"
import { Checkbook } from "app/checkbook/types"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  const session = await getSession(req, res)

  if (!session?.userId) {
    return {
      redirect: {
        destination: `/station/${params?.terminalHandle}/bulletin/rfp/${params?.rfpId}/info`,
        permanent: false,
      },
    }
  }

  const terminal = await invoke(getTerminalByHandle, { handle: params?.terminalHandle as string })

  const hasTagAdminPermissions = await invoke(hasAdminPermissionsBasedOnTags, {
    terminalId: terminal?.id as number,
    accountId: session?.userId as number,
  })

  const rfp = await invoke(getRfpById, { id: params?.rfpId })

  if (
    (!terminal?.data?.permissions?.accountWhitelist?.includes(session?.siwe?.address as string) &&
      !hasTagAdminPermissions) ||
    session.userId !== rfp?.author?.id
  ) {
    return {
      redirect: {
        destination: `/station/${params?.terminalHandle}/bulletin/rfp/${params?.rfpId}/info`,
        permanent: false,
      },
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
}

const EditRfpPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const rfpId = useParam("rfpId") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle, refetchOnWindowFocus: false }
  )

  const [checkbooks, { refetch }] = useQuery(
    getCheckbooksByTerminal,
    { terminalId: terminal?.id as number },
    { suspense: false, enabled: !!terminal, refetchOnWindowFocus: false }
  )

  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })

  return (
    <Layout title="Edit RFP">
      <RfpMarkdownForm
        checkbooks={checkbooks as unknown as Checkbook[]}
        refetchCheckbooks={refetch}
        terminal={terminal as Terminal}
        isEdit={true}
        rfp={rfp as Rfp}
      />
    </Layout>
  )
}

EditRfpPage.suppressFirstRenderFlicker = true
export default EditRfpPage
