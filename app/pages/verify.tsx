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

  if (!query.code) {
    return {
      props: {
        invalidLink: true,
      },
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
    verificationCode: query.code,
  })

  return {
    props: {
      authenticated: !!session?.userId,
      invalidLink: !emailVerification.code || !verifiedEmail,
    }, // will be passed to the page component as props
  }
}

const EmailVerificationView = ({ heading, subheading, ctaTitle, cta }) => {
  return (
    <Layout title="Verify your email">
      <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
        <h1 className="text-2xl font-bold text-marble-white text-center w-[295px]">{heading}</h1>
        <p className="mt-2 mb-6 w-72 text-center">{subheading}</p>
        {cta && (
          <button
            className="text-tunnel-black bg-electric-violet rounded h-[35px] px-6"
            onClick={cta}
          >
            {ctaTitle}
          </button>
        )}
      </div>
    </Layout>
  )
}

const EmailVerification: BlitzPage = ({
  invalidLink,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [viewState, setViewState] = useState<string>(
    invalidLink ? "INVALID" : "EMAIL_VERIFICATION_SUCCESS"
  )
  const session = useSession({ suspense: false })
  const router = useRouter()
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const [sendVerificationEmailMutation] = useMutation(sendVerificationEmail, {
    onError: (error) => {
      setViewState("ERROR")
    },
  })

  useEffect(() => {
    if (!session.siwe?.address) {
      setViewState("UNAUTHORIZED")
    } else {
      setViewState(invalidLink ? "INVALID" : "EMAIL_VERIFICATION_SUCCESS")
    }
  }, [session.siwe?.address])

  const VIEW_CONTENT = {
    UNAUTHORIZED: {
      heading: "Please connect your wallet",
      subheading: "Connect your wallet first to verify your email.",
      ctaTitle: "Connect wallet",
      cta: () => toggleWalletModal(true),
    },
    INVALID: {
      heading: "Invalid link",
      subheading: "Validate your email again here.",
      ctaTitle: "Try again",
      cta: async () => {
        const emailSent = await sendVerificationEmailMutation({
          accountId: session?.userId as number,
        })

        if (!emailSent) {
          setViewState("ERROR")
        } else {
          setViewState("VERIFICATION_SENT")
        }
      },
    },
    EMAIL_VERIFICATION_SUCCESS: {
      heading: "Email verified",
      subheading: "You'll now receive updates about your proposals.",
      ctaTitle: "Go to your profile",
      cta: () =>
        router.push(Routes.ProfileHome({ accountAddress: session?.siwe?.address as string })),
    },
    VERIFICATION_SENT: {
      heading: "Verification sent",
      subheading: "Please check your email to verify.",
      ctaTitle: "",
      cta: undefined,
    },
    ERROR: {
      heading: "Something went wrong",
      subheading: "Sorry there's was an error verifying your email. Please check back again later.",
      ctaTitle: "",
      cta: undefined,
    },
    LOADING: {
      heading: "...Loading",
      subheading: "",
      ctaTitle: "",
      cta: undefined,
    },
  }

  return <EmailVerificationView {...VIEW_CONTENT[viewState]} />
}

EmailVerification.suppressFirstRenderFlicker = true

export default EmailVerification
