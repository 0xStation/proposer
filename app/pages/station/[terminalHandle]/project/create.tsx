import { BlitzPage, GetServerSideProps, getSession, invoke } from "blitz"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RfpMarkdownForm from "app/rfp/components/RfpMarkdownForm"
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

  if (!terminal) {
    return {
      redirect: {
        destination: `/explore`,
        permanent: false,
      },
    }
  }

  const hasTagAdminPermissions = await invoke(hasAdminPermissionsBasedOnTags, {
    terminalId: terminal?.id as number,
    accountId: session?.userId as number,
  })

  if (
    !terminal?.data?.permissions?.accountWhitelist?.includes(session?.siwe?.address as string) &&
    !hasTagAdminPermissions
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

const CreateRFPPage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)

  // redirect?
  if (!activeUser) {
    return <Layout title={`New RFP`}></Layout>
  }

  return (
    <Layout title={`New RFP`}>
      <RfpMarkdownForm isEdit={false} />
    </Layout>
  )
}

CreateRFPPage.suppressFirstRenderFlicker = true
export default CreateRFPPage
