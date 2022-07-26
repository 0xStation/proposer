import {
  BlitzPage,
  GetServerSideProps,
  getSession,
  InferGetServerSidePropsType,
  invoke,
  useMutation,
  useSession,
  useRouter,
  Routes,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import getEmailVerificationByAccountId from "app/email/queries/getEmailVerificationByAccountId"
import sendVerificationEmail from "app/email/mutations/sendVerificationEmail"
import verifyEmail from "app/email/mutations/verifyEmail"
import useStore from "app/core/hooks/useStore"
import { useEffect, useState } from "react"

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const session = await getSession(req, res)

  if (!session?.userId || !session?.siwe?.address) {
    return {
      props: {},
    }
  }

  const emailVerification = await invoke(getEmailVerificationByAccountId, {
    accountId: session?.userId as number,
  })

  if (!emailVerification || !emailVerification.code) {
    return {
      props: {
        invalidLink: true,
      },
    }
  }

  const verifiedEmail = await invoke(verifyEmail, {
    accountId: session?.userId as number,
    accountAddress: session?.siwe?.address as string,
    verificationCode: emailVerification.code,
  })

  return {
    props: {
      authenticated: !!session?.userId,
      invalidLink: !emailVerification.code || !verifiedEmail,
    }, // will be passed to the page component as props
  }
}

const SuccessfulEmailVerification = ({ accountAddress }) => {
  const router = useRouter()
  return (
    <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
      <h1 className="text-2xl font-bold text-marble-white text-center w-[295px]">Email verified</h1>
      <p className="mt-2 mb-6 w-72 text-center">
        You&apos;ll now receive updates about your proposals.
      </p>
      <button
        className="text-tunnel-black bg-electric-violet rounded h-[35px] px-6"
        onClick={() => router.push(Routes.ProfileHome({ accountAddress }))}
      >
        Go to your profile
      </button>
    </div>
  )
}

const InvalidEmailVerificationLinkView = ({ setViewState }) => {
  const session = useSession({ suspense: false })
  const [sendVerificationEmailMutation] = useMutation(sendVerificationEmail, {
    onError: (error) => {
      setViewState("error")
    },
  })
  return (
    <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
      <h1 className="text-2xl font-bold text-marble-white text-center w-[295px]">Invalid link</h1>
      <p className="mt-2 mb-6 w-72 text-center">Validate your email again here.</p>
      <button
        className="text-tunnel-black bg-electric-violet rounded h-[35px] px-6"
        onClick={() => {
          sendVerificationEmailMutation({ accountId: session?.userId as number })
          setViewState("verificationSent")
        }}
      >
        Try again
      </button>
    </div>
  )
}

const UnAuthedView = () => {
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  return (
    <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
      <h1 className="text-2xl font-bold text-marble-white text-center">
        Please connect your wallet
      </h1>
      <p className="mt-2 mb-6 w-72 text-center">Connect your wallet first to verify your email.</p>
      <button
        className="text-tunnel-black bg-electric-violet rounded h-[35px] px-6"
        onClick={() => toggleWalletModal(true)}
      >
        Connect wallet
      </button>
    </div>
  )
}

const VerificationSent = () => {
  return (
    <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
      <h1 className="text-2xl font-bold text-marble-white text-center">Verification sent</h1>
      <p className="mt-2 mb-6 w-72 text-center">Please check your email to verify. </p>
    </div>
  )
}

const EmailVerification: BlitzPage = ({
  invalidLink,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [viewState, setViewState] = useState<string>(invalidLink ? "invalid" : "success")
  const session = useSession({ suspense: false })

  console.log("address", session.siwe?.address)

  useEffect(() => {
    if (!session.siwe?.address) {
      setViewState("unauthorized")
    } else {
      setViewState(invalidLink ? "invalid" : "success")
    }
  }, [session.siwe?.address])

  switch (viewState) {
    case "unauthorized":
      return (
        <Layout title="Verify your email">
          <UnAuthedView />
        </Layout>
      )
    case "invalid":
      return (
        <Layout title="Verify your email">
          <InvalidEmailVerificationLinkView setViewState={setViewState} />
        </Layout>
      )
    case "verificationSent":
      return (
        <Layout title="Verify your email">
          <VerificationSent />
        </Layout>
      )
    case "success":
      return (
        <Layout title="Verify your email">
          <SuccessfulEmailVerification accountAddress={session.siwe?.address} />
        </Layout>
      )

    case "error":
      return <div>Something went wrong</div>

    case "loading":
    default:
      return (
        <Layout title="Verify your email">
          <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
            <p className="text-marble-white">Loading</p>
          </div>
        </Layout>
      )
  }
}

EmailVerification.suppressFirstRenderFlicker = true

export default EmailVerification
